import { JwtPayload } from "jsonwebtoken";
import User from "./models/database/User";
import { Request } from "express";
import Tweet from "./models/schemas/Tweet.schema";



declare module 'express' {
  interface Request {
    decode_email_verify_token?: JwtPayload | string;
    decode_authorization?: JwtPayload | string;
    user?:JwtPayload | string;
    UpdateUserReqBody?:User;
    decode_refresh_token?:JwtPayload | string;
    tweet?: Tweet
  }
}

declare module 'slash' {
  export default function slash(path: string): string;

}