import { Response, Request, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from './validation.middlewares'
import userServices from '~/services/users.services'
import { USERS_MESSAGES } from '~/constants/message'
import { verifyToken } from '~/utils/jwt'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { match } from 'assert'
import hasPassword from '~/utils/crypto'

config()

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_STRING
  },
  trim: true,
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false
    },
    errorMessage: USERS_MESSAGES.PASSWORD_WEAK
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_STRING
  },
  trim: true,
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false
    },
    errorMessage: USERS_MESSAGES.PASSWORD_WEAK
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_STRING
  },
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: USERS_MESSAGES.NAME_LENGTH
  },
  trim: true
}

const date_of_birthSchema: ParamSchema = {
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: USERS_MESSAGES.DOB_INVALID
  }
}

const imageSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_STRING
  },
  optional: true,
  trim: true
}

const bioSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.BIO_STRING
  },
  trim: true,
  optional: true
}

const locationSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.LOCATION_STRING
  },
  trim: true,
  optional: true
}

const websiteSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.WEBSITE_URL_IS_STRING
  },
  optional: true
}

const usernameSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.USERNAME_STRING,
  },
  trim: true,
  optional: true,
  matches: {
    options: /^[a-zA-Z0-9]+$/,
    errorMessage: 'Username should only contain letters and numbers.',
  },
  isLength: {
    options: { min: 3, max: 20 },
    errorMessage: 'Username should be between 3 and 20 characters long.',
  },
};

const coverPhotoSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.COVER_PHOTO_STRING
  },
  trim: true,
  optional: true
}

// const forgotPasswordSchema : ParamSchema = {
//   trim: true,
//   custom: {
//     options: async (value: string, { req }) => {
//       if (!value) {
//         throw new ErrorWithStatus({
//           message: USERS_MESSAGES.EMAIL_REQUIRED,
//           status: HTTP_STATUS.UNAUTHORIZED
//         })
//       }
//       // xác nhận email gửi lên , tìm user
//       const user = await databaseService.users.findOne({ email: value })
//       // sau khi tìm user thì gán user vào req để chuyển đến controller
//       req.user = user

//       return true
//     }
//   }

// }

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_INVALID
        },
        trim: true
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.NAME_LENGTH
        },
        trim: true
      },

      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const emailExist = await userServices.checkEmailExist(value)
            if (emailExist !== null) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },

      // password: {
      //   notEmpty: {
      //     errorMessage: USERS_MESSAGES.PASSWORD_REQUIRED
      //   },
      //   isString: {
      //     errorMessage: USERS_MESSAGES.PASSWORD_STRING
      //   },
      //   trim: true,
      //   isLength: {
      //     options: { min: 6, max: 50 },
      //     errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
      //   },
      //   isStrongPassword: {
      //     options: {
      //       minLength: 6,
      //       minLowercase: 1,
      //       minUppercase: 1,
      //       minNumbers: 1,
      //       minSymbols: 1,
      //       returnScore: false
      //     },
      //     errorMessage: USERS_MESSAGES.PASSWORD_WEAK
      //   }
      // },

      // confirm_password: {
      //   notEmpty: {
      //     errorMessage: USERS_MESSAGES.PASSWORD_REQUIRED
      //   },
      //   isString: {
      //     errorMessage: USERS_MESSAGES.PASSWORD_STRING
      //   },
      //   trim: true,
      //   isLength: {
      //     options: { min: 6, max: 50 },
      //     errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
      //   },
      //   isStrongPassword: {
      //     options: {
      //       minLength: 6,
      //       minLowercase: 1,
      //       minUppercase: 1,
      //       minNumbers: 1,
      //       minSymbols: 1,
      //       returnScore: false
      //     },
      //     errorMessage: USERS_MESSAGES.PASSWORD_WEAK
      //   },
      //   custom: {
      //     options: (value, { req }) => {
      //       if (value !== req.body.password) {
      //         throw new Error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      //       }
      //       return true
      //     }
      //   }
      // },

      password: passwordSchema,
      confirm_password: confirmPasswordSchema,

      date_of_birthday: {
        isISO8601: {
          options: { strict: true, strictSeparator: true },
          errorMessage: USERS_MESSAGES.DOB_INVALID
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (access_token === '') {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            const decode_authorization = await verifyToken({
              token: access_token,
              secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
            })
            req.decode_authorization = decode_authorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                console.log('🚀 ~ options: ~ value:', value),
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              req.decode_refresh_token = decode_refresh_token
              return true
            } catch (err) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.VERIFY_TOKEN_IS_REQUIRED
        },
        // phải xác nhận rằng chắc chắn phải có 1 token gửi lên
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            // giải token gửi lên đó , nếu đúng là token mà server gửi cho thì tiến hành decode
            const decode_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })
            // tiếp tục gán những giá trị đó vào req để chuyển sang bước xử lí tiếp theo
            req.decode_email_verify_token = decode_email_verify_token
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      // validate đã gửi email lên
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_INVALID
        },

        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            // xác nhận email gửi lên , tìm user
            const user = await databaseService.users.findOne({ email: value })
            // sau khi tìm user thì gán user vào req để chuyển đến controller
            req.user = user

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            // 1. Nếu không có token thì thông báo lỗi
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            // 2. Nếu có token thì tiến hành decode
            const decode_forgot_pass = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
            })

            // 3. Sau khi decode thì tìm user từ user_id
            const { user_id } = decode_forgot_pass as { user_id: string }
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

            // 4. Nếu không có user thì trả về message
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            // 5. Nếu có user, kiểm tra token có khớp không
            if (user.forgot_password_token !== value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.VERIFY_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            // 6. Gắn thông tin user vào request
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
      // forgot_password_token: forgotPasswordSchema
    },
    ['body']
  )
)
export const verifyAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
  // lấy id kiểm tra user xem user đã verify tài khoản chưa
  try {
    const { user_id } = req.decode_authorization as { user_id: string }
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      return next(
        new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      )
    }

    if (user.verify !== UserVerifyStatus.Verify) {
      return next(
        new ErrorWithStatus({
          message: USERS_MESSAGES.ACCOUNT_NOT_VERIFY,
          status: HTTP_STATUS.FORBIDDEN
        })
      )
    }

    next() // Tiếp tục với middleware hoặc route handler tiếp theo
  } catch (error) {
    next(error) // Xử lý lỗi nếu có ngoại lệ xảy ra
  }
}

export const updateMeValidator = validate(
  checkSchema({
    name: {
      ...nameSchema,
      optional: true,
      notEmpty: undefined
    },
    date_of_birth: {
      ...date_of_birthSchema,
      optional: true
    },
    avatar: imageSchema,
    bio: bioSchema,
    location: locationSchema,
    website: websiteSchema,
    username: usernameSchema,
    cover_photo: coverPhotoSchema
  })
)

export const followValidator = validate(
  checkSchema({
    follow_id: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.FOLLOW_ID_IS_REQUIRED
      },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          // ktra follow_id co ton tai khong
          const follow = await databaseService.users.findOne({
            _id: new ObjectId(value)
          })

          if (!follow) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)

export const unFollowValidator = validate(
  checkSchema({
    follow_id: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.FOLLOW_ID_IS_REQUIRED
      },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          // ktra follow_id co ton tai khong
          const follow = await databaseService.users.findOne({
            _id: new ObjectId(value)
          })
          if (follow === null) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.FOLLOWER_ID_IS_INVALIDATED,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  }, ['params'])
)

export const changePassValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = req.decode_authorization as { user_id: string }
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            if (user.password !== hasPassword(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.OLD_PASSWORD_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      },

      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
