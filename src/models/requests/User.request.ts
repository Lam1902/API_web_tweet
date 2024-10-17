import { JwtPayload } from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { TokenType, UserVerifyStatus } from "~/constants/enum"

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string,

}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface updateAccountReqBody {
  name?: string
  date_of_birth?: Date

  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string,
  twitter_circle?: ObjectId[]
}

export interface followersReqBody {
  follow_id: string
}

export interface unFollowReqBody {
  follow_id: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string,
  token_type: TokenType,
  verify: UserVerifyStatus
}

export interface decode_refresh_token_Req {
  refresh_token: string
}