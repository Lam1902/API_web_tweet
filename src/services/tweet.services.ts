import { TweetRequestBody } from "~/models/requests/Tweet.requests"
import databaseService from "./database.services"
import Tweet from "~/models/schemas/Tweet.schema"
import { ObjectId, WithId } from "mongodb"
import Hashtag from "~/models/schemas/Hashtag.shema"
import { TweetType } from "~/constants/enum"


class TweetServices {

  async checkHashtagCreateOfUpdate(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map(async hashtag => {
        const result = await databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          {
            upsert: true,
            returnDocument: "after",
          }
        );
        return result!._id; // Lấy _id của mỗi hashtag sau khi findOneAndUpdate
      })
    );
    return hashtagDocuments; // Trả về danh sách các _id
  }


  async createTweet_SV(body: TweetRequestBody, user_id: string) {

    const hashtags = await this.checkHashtagCreateOfUpdate(body.hashtags)

    const result = await databaseService.tweets.insertOne(new Tweet({
      audience: body.audience,
      content: body.content,
      hashtags,
      mentions: body.mentions,
      medias: body.medias,
      parent_id: body.parent_id,
      type: body.type,
      user_id: new ObjectId(user_id),
      guest_views: 0,
      created_at: new Date(),

    }))
    return result
  }

  async increaseGuestViews_SV(tweet_id: string, user_id: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: "after",
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result as {
      guest_views: number,
      user_views: number,
      updated_at: Date
    }
  }

  async getTweetChildren_SV(
    {
      tweet_id,
      tweet_type,
      limit,
      page,
      user_id
    }: {
      tweet_id: string,
      tweet_type: number,
      limit: number,
      page: number,
      user_id: string | undefined
    }
  ) {
    const tweets = await databaseService.tweets
    .aggregate<Tweet>(
      [
        {
          '$match': {
            'parent_id': new ObjectId(tweet_id),
            'type': tweet_type
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
                          '$$item.type', TweetType.Retweet
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
                          '$$item.type', TweetType.Comment
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
                          '$$item.type', TweetType.QuoteTweet
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
        }, {
          '$skip': limit * (page - 1)
        }
        , {
          '$limit': limit
        }
      ]
    ).toArray()

    const total = await databaseService.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: tweet_type
    })

   
    const inc = user_id ? {user_views: 1} : {guest_views: 1}
    const ids = tweets.map(tweet => tweet._id as ObjectId)
    await databaseService.tweets.updateMany({
      _id: {
        $in: ids
      }
    },
    {
      $inc: inc,
      $set: {
        updated_at: new Date()
      }
    }
  )

  tweets.forEach(tweet => {
    if(user_id) {
      tweet.user_views = (tweet.user_views ?? 0) + 1
    } else {
      tweet.guest_views += 1
    }
  })
    return {
      tweets: tweets,
      total: total,
      limit: limit,
      page: page,
      pages: Math.ceil(total / limit)
    }
  }


}

const tweetServices = new TweetServices()

export default tweetServices