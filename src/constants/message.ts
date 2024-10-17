export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_REQUIRED: 'Name is required',
  NAME_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name must be between 1 and 100 characters',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email address',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_STRING: 'Password must be a string',
  PASSWORD_LENGTH: 'Password must be between 6 and 50 characters',
  PASSWORD_WEAK: 'Password must have at least 6 characters, including uppercase, lowercase, number, and symbol',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  DOB_INVALID: 'Invalid date of birth',
  USER_NOT_FOUND: 'User not found',
  EMAIL_INCORRECT : 'Email incorrect',
  PASS_INCORRECT: "Password incorrect",
  ACCESS_TOKEN_IS_REQUIRED: "AccessToken is required",
  REFRESH_TOKEN_IS_REQUIRED: "Refresh is required",
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'LogOut success',
  LOGOUT_FAILED: 'LogOut failed',
  VERIFY_TOKEN_IS_REQUIRED: 'Verify token is required',
  VERIFY_TOKEN_IS_INVALID: 'Verify token is invalid',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFIED_SUCCESS: 'Email verified success',
  EMAIL_RESEND_SUCCESS: 'Email resend success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_ME_SUCCESS: 'Get me success',
  ACCOUNT_NOT_VERIFY: 'ACCOUNT_NOT_VERIFY',
  IMAGE_STRING: 'Image must be a string',
  BIO_STRING: 'Bio must be a string',
  LOCATION_STRING: 'Location must be a string',
  WEBSITE_URL_IS_STRING: 'Website must be a string',
  USERNAME_STRING: 'Username must be a string',
  COVER_PHOTO_STRING: 'Cover photo must be a string',
  UPDATE_ME_SUCCESS: 'Update me success',
  USER_ID_IS_REQUIRED: 'User id is required',
  FOLLOW_ID_IS_REQUIRED: 'Follow id is required',
  USER_FOLLOWED: 'User followed',
  FOLLOW_SUCCESS: 'Follow success',
  FOLLOWER_ID_IS_INVALIDATED: 'Follower id is invalidated',
  USER_NOT_FOLLOWED: 'You not followed this user',
  UNFOLLOW_SUCCESS: 'UnFollow success',
  OLD_PASSWORD_IS_INVALID: 'Old password is invalid',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  UPLOAD_SUCCESS: 'upload successfully'
  
} as const;


export const TWEET_MESSAGES = {
  INVAIDE_TYPE: 'Invaide type',
  INVALID_AUDIENCE: 'Invalid audience',
  INVALID_CONTENT: 'Invalid content',
  INVALID_PARENT_ID: 'Invalid parent id',
  INVALID_HASHTAGS: 'Invalid hashtags',
  INVALID_MENTIONS: 'Invalid mentions',
  INVALID_MEDIA: 'Invalid media',
  INVALID_GUEST_VIEWS: 'Invalid guest views',
  INVALID_USER_VIEWS: 'Invalid user views',
  INVALID_CREATED_AT: 'Invalid created at',
  PARENT_ID_MUST_BE_A_VALID_TWEET: 'Parent id must be a valid tweet',
  CONTENT_IS_REQUIRED: 'Content is required',
  CONTENT_MUST_BE_EMPTY: 'Content must be empty',
  HASHTAG_MUST_BE_STRING: 'Hashtag must be a string',
  MENTION_MUST_BE_USER_ID: 'Mention must be a user id',
  MEDIA_MUST_BE_MEDIA_OBJECT: 'Media must be a media object',
  CREATE_TWEET_SUCCESS: 'Create tweet success',
  INVALID_TWEET_ID: 'Invalid tweet id',
  TWEET_NOT_FOUND: 'Tweet not found',
  UNAUTHORIZED: 'Unauthorized',
  TWEET_NOT_PUBLIC: 'Tweet not public'
}

export const BOOKMARK_MESSAGES = {
  CREATE_BOOKMARK_SUCCESS :  'Create bookmark success',
  UN_BOOKMARK_SUCCESS: 'Un bookmark success'
}

export const LIKE_MESSAGES = {
  CREATE_LIKE_SUCCESS :  'Create like success',
  UN_LIKE_SUCCESS: 'Un like success'
}