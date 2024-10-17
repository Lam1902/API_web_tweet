import { Router, Request, Response } from 'express'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  forgotPasswordValidator,
  verifyForgotPasswordValidator,
  resetPasswordValidator,
  verifyAccountValidator,
  updateMeValidator,
  followValidator,
  unFollowValidator,
  changePassValidator
} from '~/middlewares/user.middleware'
import {
  loginController,
  logoutController,
  registerController,
  emailVerifyController,
  resendEmailVerifyController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  handleFollowerController,
  handleUnFollowController,
  changePassController,
  oauthGoogleController,
  refreshTokenController
} from '~/controller/user.controllers'
import { wrapRequestHandler } from '~/middlewares/handlers'

import { fillMiddleware } from '~/middlewares/common.middleware'

import { updateAccountReqBody } from '~/models/requests/User.request'

const userRouter = Router()

// login , register, forgot pass

userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
userRouter.get('/oauth/google', wrapRequestHandler(oauthGoogleController))
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))
userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))
userRouter.post('/request-forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
userRouter.post('/verify-request-forgot-password',verifyForgotPasswordValidator,wrapRequestHandler(verifyForgotPasswordController))
userRouter.post('/reset-password', resetPasswordValidator,verifyForgotPasswordValidator,wrapRequestHandler(resetPasswordController))

// token
userRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))


// user

userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
userRouter.patch(
  '/update-me',
  accessTokenValidator,
  verifyAccountValidator,
  updateMeValidator,
  fillMiddleware<updateAccountReqBody>(['name', 'bio', 'date_of_birth', 'avatar', 'cover_photo', 'location', 'website', 'username', 'twitter_circle']),
  wrapRequestHandler(updateMeController)
)
userRouter.post('/followers', accessTokenValidator,verifyAccountValidator,followValidator,  wrapRequestHandler(handleFollowerController))
userRouter.delete('/unFollow/:follow_id', accessTokenValidator,verifyAccountValidator, unFollowValidator, wrapRequestHandler(handleUnFollowController))
userRouter.put('/change-password', accessTokenValidator, verifyAccountValidator,changePassValidator, wrapRequestHandler(changePassController))

export default userRouter
