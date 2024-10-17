import { ObjectId } from "mongodb"


interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: Object,
  iat: number,
  exp: number
}
 
export class RefreshToken {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: Object
  iat: Date
  exp: Date
  constructor({_id, token, created_at = new Date(), user_id, iat, exp}:RefreshTokenType) {
    this._id = _id
    this.created_at = created_at
    this.token = token
    this.user_id = user_id
    this.iat = new Date(iat * 1000)
    this.exp = new Date(iat * 1000)
}
}