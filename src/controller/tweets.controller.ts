
import { Request, Response, NextFunction } from "express"
import tweetServices from "~/services/tweet.services"
import { TWEET_MESSAGES } from "~/constants/message"
import { TweetType } from "~/constants/enum"
import { update } from "lodash"


export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as { user_id: string }
  const result = await tweetServices.createTweet_SV(req.body, user_id)
  return res.json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  })
}

export const getTweetsController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const { user_id } = req.decode_authorization as { user_id: string }
  const result = await tweetServices.increaseGuestViews_SV(tweet_id, user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: 'get tweets successfully ',
    result: tweet
  })
}



export const getTweetsChildrenController = async (req: Request, res: Response) => {
  const {user_id} = req.decode_authorization as { user_id: string }
  const result = await tweetServices.getTweetChildren_SV({
    tweet_id: req.params.tweet_id,
    tweet_type: Number(req.query.tweet_type as string) as TweetType,
    limit: Number(req.query.limit) || 5,
    page: Number(req.query.page) || 1,
    user_id: user_id || undefined
  })

  console.log(parseInt((req.query.limit as string)?.trim(), 10))
  console.log( 'params', req.params)
  console.log( 'query', req.query)

  
  return res.json({
    message: 'get tweets children successfully',
    result
  })
}  
