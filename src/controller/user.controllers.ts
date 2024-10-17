import { Response, Request, NextFunction } from 'express'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body
    const result = await userServices.login(email, password)
    res.status(HTTP_STATUS.OK).json({
      result
    })
  } catch (error) {
    next(error)
  }
}

export const oauthGoogleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query
    const result = await userServices.oauthLogin_SV(code as string)
    const uriRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${(result as { new_user: boolean }).new_user}&verify=${(result as { verify: UserVerifyStatus }).verify}`
    return res.redirect(uriRedirect)
  } catch (error) {
    next(error)
  }
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userServices.register(req.body)
  return res.json({
    errCode: 0,
    message: 'Register success',
    data: result
  })
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body
    const result = await userServices.logout(refresh_token)

    if (result) {
      res.status(HTTP_STATUS.OK).json({
        message: USERS_MESSAGES.LOGOUT_SUCCESS
      })
    } else {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: USERS_MESSAGES.LOGOUT_FAILED
      })
    }
  } catch (err) {
    next(err)
  }
}

export const emailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  // lấy user_id từ decode đã đc lưu
  const { user_id } = req.decode_email_verify_token as { user_id: string }
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  // nếu không tìm thấy user thì báo lỗi

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  // nếu ng dùng đã xác nhận tài khoản
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }

  // verify tài khoản ng dùng
  userServices.emailVerify(user_id)

  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // lấy thông tin user từ client gửi lên
  const { user_id } = req.decode_authorization as { user_id: string }
  console.log('🚀 ~ resendEmailVerifyController ~ user_id:', user_id)
  // tìm xem user đó có tồn tại không
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // nếu tồn tại thì xem user đó đã verify chưa
  if (user.email_verify_token !== '' && user.verify === 1) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  // nếu chưa thì tiến hành cấp lại token cho user và cập nhật ngày
  const result = await userServices.resendEmailVerify(user_id)

  // thông báo cấp lại thành công, đồng thời trả lại client 2 token
  return res.json({
    message: USERS_MESSAGES.EMAIL_RESEND_SUCCESS,
    result
  })
}

// refresh token
export const refreshTokenController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decode_refresh_token as { user_id: string, verify: UserVerifyStatus , exp: number}
  const result = await userServices.refreshToken_SV({ refresh_token, verify, user_id, exp })
  return res.json({
    result
  })
}

// yêu cầu quên mật khẩu
export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy email và gửi cho service để xử lý
  const { email } = req.body
  const result = await userServices.forgotPassword(email)
  //nhận về kết quả và trả về cho client
  return res.json({
    result
  })
}

// xác nhận yêu cầu quên mật khẩu
export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { password } = req.body
  console.log('check 112: ', req.user)
  const { _id } = req.user as { _id: string }
  // doi mat khau nguoi dung
  const result = await userServices.resetPassword(_id, password)
  // tra ve ket qua
  return res.json({
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  console.log(req.user)
  const { user_id } = req.decode_authorization as { user_id: string }
  const result = await userServices.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

export const updateMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as { user_id: string }

  const result = await userServices.updateMe(user_id, req.body)

  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    new_user: result
  })
}

export const handleFollowerController = async (req: Request, res: Response) => {
  // lay 2 id
  const { user_id } = req.decode_authorization as { user_id: string }
  const follow_id = req.body.follow_id

  // thuc hien follow
  const result = await userServices.handleFollower_SV(user_id, follow_id)

  return res.json({
    result
  })
}

export const handleUnFollowController = async (req: Request, res: Response) => {
  // lay 2 id
  const { user_id } = req.decode_authorization as { user_id: string }
  const { follow_id } = req.params

  // thuc hien follow
  const result = await userServices.handleUnFollow_SV(user_id, follow_id)

  return res.json({
    result
  })
}

export const changePassController = async (req: Request, res: Response) => {
  // lay user va password
  const { user_id } = req.decode_authorization as { user_id: string }
  const { password } = req.body
  const result = await userServices.changePass_SV(user_id, password)
  return res.json({
    result
  })
}
