
import { checkSchema } from 'express-validator'
import { validate } from './validation.middlewares'
import { numberEnumToArray } from '~/utils/commons'
import { MediaType, TweetType } from '~/constants/enum'
import { TweetAudience } from '~/constants/enum'
import { TWEET_MESSAGES, USERS_MESSAGES } from '~/constants/message'
import { ObjectId } from 'mongodb'
import { isEmpty } from 'lodash'
import { hash } from 'crypto'
import databaseService from '~/services/database.services'
import { NextFunction } from 'express'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { wrapRequestHandler } from './handlers'
import { UserVerifyStatus } from '~/constants/enum'
import Tweet from '~/models/schemas/Tweet.schema'



const tweetTypes = numberEnumToArray(TweetType)
const tweetAUdience = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEET_MESSAGES.INVAIDE_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAUdience],
          errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE
        }
      },
      // parent_id: {
      //   custom: {
      //     options: (value, {req}) => {
      //       const type = req.body.type
      //       if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet ].includes(type) && ObjectId.isValid(value)) {  
      //         throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET)
      //       }

      //       if(type === TweetType.Tweet && value !== null) {
      //         throw new Error(TWEET_MESSAGES.INVALID_PARENT_ID)
      //       }
      //       return true
      //     }
      //   }
      // },

      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            // nếu là comment , câu hỏi, bài đăng 
            if ([TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) && value === '' && isEmpty(hashtags) && isEmpty(mentions)) {
              throw new Error(TWEET_MESSAGES.CONTENT_IS_REQUIRED)
            }

            // nếu là bài đăng lại thì content là rỗng
            if (type === TweetType.Retweet && value !== '') {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY)
            }
            return true
          }
        }
      },

      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // mỗi hastag trong cái arr phải là string
            if (value.some(hashtag => typeof hashtag !== 'string')) {
              throw new Error(TWEET_MESSAGES.HASHTAG_MUST_BE_STRING)
            }
            return true
          }
        }
      },

      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // mỗi mention trong là arr phải là user_id
            if (!value.every(mention => ObjectId.isValid(mention))) {
              throw new Error(TWEET_MESSAGES.MENTION_MUST_BE_USER_ID)
            }
            return true
          }
        }
      },

      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // một media trong là arr phải là Media Object
            if (value.some(media => {
              return typeof media.url !== 'string' || !mediaTypes.includes(media.type as MediaType)

            })) {
              throw new Error(TWEET_MESSAGES.MEDIA_MUST_BE_MEDIA_OBJECT)
            }
            return true
          }
        }
      }

    }
  ))


export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: {
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_ID
        },
        custom: {
          options: async (value, { req }) => {
            const [tweet] = await databaseService.tweets
            .aggregate<Tweet>([
              {
                '$match': {
                  '_id': new ObjectId(value)
                }
              }, {
                '$lookup': {
                  'from': 'hashtags',
                  'localField': 'hashtags',
                  'foreignField': '_id',
                  'as': 'hashtags'
                }
              }, {
                '$lookup': {
                  'from': 'mentions',
                  'localField': 'mentions',
                  'foreignField': '_id',
                  'as': 'mentions'
                }
              }, {
                '$addFields': {
                  'mentions': {
                    '$map': {
                      'input': '$mentions',
                      'as': 'mention',
                      'in': {
                        '_id': '$$mention._id',
                        'name': '$$mention.name',
                        'username': '$$mention.username',
                        'email': '$$mention.email'
                      }
                    }
                  }
                }
              }, {
                '$lookup': {
                  'from': 'tweets',
                  'localField': '_id',
                  'foreignField': 'parent_id',
                  'as': 'tweets_children'
                }
              }, {
                '$addFields': {
                  'bookmarks': {
                    '$size': {
                      '$ifNull': [
                        '$bookmarks', []
                      ]
                    }
                  },
                  'likes': {
                    '$size': {
                      '$ifNull': [
                        '$likes', []
                      ]
                    }
                  },
                  'retweet_count': {
                    '$size': {
                      '$ifNull': [
                        {
                          '$filter': {
                            'input': '$tweets_children',
                            'as': 'item',
                            'cond': {
                              '$eq': [
                                '$$item.type', 1
                              ]
                            }
                          }
                        }, []
                      ]
                    }
                  },
                  'Comment_count': {
                    '$size': {
                      '$ifNull': [
                        {
                          '$filter': {
                            'input': '$tweets_children',
                            'as': 'item',
                            'cond': {
                              '$eq': [
                                '$$item.type', 2
                              ]
                            }
                          }
                        }, []
                      ]
                    }
                  },
                  'QuoteTweet_count': {
                    '$size': {
                      '$ifNull': [
                        {
                          '$filter': {
                            'input': '$tweets_children',
                            'as': 'item',
                            'cond': {
                              '$eq': [
                                '$$item.type', 3
                              ]
                            }
                          }
                        }, []
                      ]
                    }
                  },
                  'view': {
                    '$add': [
                      '$guest_views', '$user_views'
                    ]
                  }
                }
              }, {
                '$project': {
                  'tweets_children': 0
                }
              }
            ]).toArray()

            if (!tweet) {
              throw new Error(TWEET_MESSAGES.TWEET_NOT_FOUND)

            }

            req.tweet = tweet

            return true
          }
        }

      }
    }
  )
)

export const audienceValidator = wrapRequestHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tweet = req.tweet;

    // Kiểm tra nếu audience của tweet là Twitter Circle
    if (tweet?.audience === TweetAudience.TwitterCircle) {

      // Kiểm tra xem người dùng đã đăng nhập hay chưa
      const decodedAuth = req.decode_authorization as { user_id: string } | undefined;
      if (!decodedAuth) {
        return next(new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TWEET_MESSAGES.UNAUTHORIZED
        }));
      }

      // Lấy thông tin tác giả của tweet
      const author = await databaseService.users.findOne({
        _id: new ObjectId(tweet.user_id)
      });
      // Kiểm tra nếu tài khoản không tồn tại hoặc bị khóa
      if (!author || author.verify === UserVerifyStatus.Banned) {
        return next(new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGES.USER_NOT_FOUND
        }));
      }

      // Kiểm tra người xem có nằm trong Twitter Circle hay không
      const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => {
        const id_user = new ObjectId(decodedAuth.user_id)
        const check = new ObjectId(user_circle_id).equals(id_user)
        if (check) {
          return true
        }
      }

      );

      // Nếu không phải tác giả hoặc không trong Twitter Circle
      if (!author._id.equals(new ObjectId(decodedAuth.user_id)) && !isInTwitterCircle) {
        return next(new ErrorWithStatus({
          status: HTTP_STATUS.FORBIDDEN,
          message: TWEET_MESSAGES.TWEET_NOT_PUBLIC
        }));
      }
    }

    // Gọi hàm tiếp theo trong middleware nếu tất cả kiểm tra đều hợp lệ
    next();
  }
);
