export enum UserVerifyStatus {
  Unverified, // chưa xác thực email , mặc định là 0
  Verify, // đã xác thực
  Banned // đã bị khóa
}
 
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken,
}

export enum MediaType {
  Image,
  Video
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}

export enum EncodingStatus {

  Pending,
  Processing,
  Success,
  Failed

}

