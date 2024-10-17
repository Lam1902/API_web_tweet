import { RegisterReqBody } from '~/models/requests/User.request'
import databaseService from './database.services'
import User from '~/models/database/User'
import hasPassword from '~/utils/crypto'
import { ObjectId } from 'mongodb'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import { RefreshToken } from '~/models/requests/RequestToken.schema'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/message'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { config } from 'dotenv'
import { UserVerifyStatus } from '~/constants/enum'
import { Follower } from '~/models/database/Follower'
import axios from 'axios'
import { verify } from 'crypto'
config()

class UserServices {
  // phương thức đăng kí
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    // tạo 1 email verify token để thêm vào dữ liệu
    const email_verify_token = await this.SignEmailVerifyToken(user_id.toString())
    // add user vào db
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hasPassword(payload.password),
        email_verify_token,
        _id: user_id
      })
    )
    // tạo 2 biến token
    const [access_token, refresh_token] = await this.SignAccessAndFreshToken(user_id.toString())
    const {iat, exp} = await this.decodeRefreshToken(refresh_token) as {iat: number, exp: number}
    // add ref token vào db
    databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )

    return {
      access_token,
      refresh_token,
      result
    }
  }

  // phương thức đăng nhập
  async login(email: string, password: string) {
    const user = await databaseService.users.findOne({ email })
    //nếu không có user
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_INCORRECT,
        status: HTTP_STATUS.NO_CONTENT
      })
    }

    // nếu pass sai
    if (user.password !== hasPassword(password)) {
      throw new Error(USERS_MESSAGES.PASS_INCORRECT)
    }

    const user_id = user._id
    // tạo 2 biến token
    const [access_token, refresh_token] = await this.SignAccessAndFreshToken(user_id.toString())
    const {iat, exp} = await this.decodeRefreshToken(refresh_token) as {iat: number, exp: number}
    // add ref token vào db
    databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )
    return { message: 'Login success', access_token, refresh_token, user }
  }

  // đăng nhập bằng google
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const data = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    return data
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
      grant_type: 'authorization_code'
    }

    const data = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data
  }

  async oauthLogin_SV(code: string) {
    const data = await this.getOauthGoogleToken(code)
    const { id_token, access_token } = data.data
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)

    // kiểm tra xem user email đó đã đăng kí chưa

    const user = await databaseService.users.findOne({ email: userInfo.data.email })
    // nếu đã đăng kí rồi thì tiến hành login

    if (user) {
      const [access_token, refresh_token] = await this.SignAccessAndFreshToken(user._id.toString())
      const {iat, exp} = await this.decodeRefreshToken(refresh_token) as {iat: number, exp: number}
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user._id),
          token: refresh_token,
          iat: iat,
          exp: exp
        })
      )

      return {
        access_token,
        refresh_token,
        new_user: false,
        verify: user.verify
      }
    } else {
      const password = Math.random().toString(36).substring(2, 7)
      const data = this.register({
        email: userInfo.data.email,
        password,
        confirm_password: password,
        name: userInfo.data.name,
        date_of_birth: new Date().toISOString()
      })

      return {
        ...data,
        new_user: true,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    console.log('🚀 ~ UserServices ~ logout ~ result:', result)
    return result.deletedCount > 0
  }

  // phương thức check user tồn tại hay chưa
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return user
  }

  // phương thức tạo access_token và ref token cùng 1 lúc
  private async SignAccessAndFreshToken(user_id: string) {
    return Promise.all([this.SignAccessToken(user_id), this.SignReFreshToken(user_id)])
  }

  // phương thức tạo access_token
  private async SignAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  // phương thức tạo ref token
  private async SignReFreshToken(user_id: string, exp?: number) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,

      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,

    })
  }

  // decode refreshToken 
  private async decodeRefreshToken(refresh_token: string) {
    const decoded_value = await verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })

    return decoded_value
  }
  // phương thức tạo email verify token
  private async SignEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  // tạo forgot password token
  private async SignForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  // email verify dùng để cập nhật email đã đc verify và trả về 2 token cho client
  async emailVerify(user_id: string) {
    const [token] = await Promise.all([
      this.SignAccessAndFreshToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            updated_at: new Date(),
            verify: UserVerifyStatus.Verify
          }
        }
      )
      // tạo 2 biến token
    ])

    const [access_token, refresh_token] = token
    const {iat, exp} = await this.decodeRefreshToken(refresh_token) as {iat: number, exp: number}
    // add ref token vào db
    databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat:iat,
        exp: exp
      })
    )
    return { access_token, refresh_token }
  }

  // resend email verify
  async resendEmailVerify(user_id: string) {
    // Đăng ký lại các token: access token, refresh token và email verify token
    const [accessAndRefreshToken, emailVerifyToken] = await Promise.all([
      this.SignAccessAndFreshToken(user_id),
      this.SignEmailVerifyToken(user_id),
    ])

    const [access_token, refresh_token] = accessAndRefreshToken
    const {iat, exp} = await this.decodeRefreshToken(refresh_token) as {iat: number, exp: number}
    // Lưu refresh token vào database
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat:iat,
        exp: exp
      })
    )

    // Lưu email verify token vào database
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: emailVerifyToken,
          updated_at: new Date()
        }
      }
    )

    // Trả về access token và refresh token cho client
    return { access_token, refresh_token }
  }

  // forgot password
  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    if (!user) {
      throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
    }

    // tạo và lưu forgot password token
    const forgot_password_token = await this.SignForgotPasswordToken(user._id.toString())

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user._id)
      },
      {
        $set: {
          forgot_password_token,
          updated_at: new Date()
        }
      }
    )

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  // reset password
  async resetPassword(user_id: string, password: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
    }
    // neu co user thi cap nhat user
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hasPassword(password),
          forgot_password_token: '',
          updated_at: new Date()
        }
      }
    )

    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  //tao moi refresh token
  async refreshToken_SV({ user_id, refresh_token, verify, exp }: { user_id: string, refresh_token: string, verify: UserVerifyStatus, exp: number }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.SignAccessToken(user_id),
      this.SignReFreshToken(user_id, exp),
      databaseService.refreshTokens.deleteOne({
        token: refresh_token
      })
    ])

    const kq = await this.decodeRefreshToken(new_refresh_token) as {iat: Date, exp: Date}
    const iat = kq.iat
    const exp1 = kq.exp

    await databaseService.refreshTokens.insertOne({ token: new_refresh_token, user_id: new ObjectId(user_id), iat: iat, exp: exp1  })
    return { new_access_token, new_refresh_token }
  }

  // get me
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          forgot_password_token: 0
        }
      }
    )
    if (!user) {
      throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
    }
    return user
  }

  // update
  async updateMe(user_id: string, data: object) {
    try {
      // Kiểm tra và lọc các trường không hợp lệ trong data
      const updateData = {
        ...data,
        updated_at: new Date() // Cập nhật trường updated_at
      }

      // Tìm kiếm và cập nhật user theo user_id
      const user = await databaseService.users.findOneAndUpdate(
        { _id: new ObjectId(user_id) },
        { $set: updateData },
        {
          returnDocument: 'after', // Trả về tài liệu sau khi cập nhật
          projection: {
            password: 0,
            forgot_password_token: 0,
            email_verify_token: 0
          }
        }
      )

      return user // Trả về user sau khi cập nhật (loại bỏ password và forgot_password_token)
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Could not update user')
    }
  }

  // follower
  async handleFollower_SV(user_id: string, follow_id: string) {
    try {
      const follow = await databaseService.followers.findOne({
        user_id: new ObjectId(user_id),
        follow_id: new ObjectId(follow_id)
      })

      if (follow) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_FOLLOWED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          follow_id: new ObjectId(follow_id)
        })
      )

      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS
      }
    } catch (error) {
      console.error('Error in handleFollower_SV:', error)
      throw error
    }
  }

  async handleUnFollow_SV(user_id: string, follow_id: string) {
    try {
      // kiem tra xem nguoi dung da follow chua
      const follow = await databaseService.followers.findOne({
        user_id: new ObjectId(user_id),
        follow_id: new ObjectId(follow_id)
      })

      // neu chu follow thi hien thi thong bao
      if (!follow) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOLLOWED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      // neu dang follow thi xoa
      await databaseService.followers.deleteOne({
        user_id: new ObjectId(user_id),
        follow_id: new ObjectId(follow_id)
      })

      return {
        message: USERS_MESSAGES.UNFOLLOW_SUCCESS
      }
    } catch (err) {
      throw err
    }
  }

  async changePass_SV(user_id: string, password: string) {
    try {
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            password: hasPassword(password),
            updated_at: new Date()
          }
        }
      )
      return {
        message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
      }
    } catch (err) {
      throw err
    }
  }
}

const userServices = new UserServices()
export default userServices
