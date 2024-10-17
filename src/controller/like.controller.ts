
import { Request, Response, NextFunction } from "express"
import { LIKE_MESSAGES } from "~/constants/message"
import likeServices from "~/services/likes.services"


export const likeController = async (req: Request, res: Response, ) => {
  const {user_id} = req.decode_authorization as {user_id: string}
  const result = await likeServices.like_SV( user_id, req.body.tweet_id )
  return res.json({
    message: LIKE_MESSAGES.CREATE_LIKE_SUCCESS,
    result
  })
}

export const un_likeController = async (req: Request, res: Response, ) => {
  const {user_id} = req.decode_authorization as {user_id: string}

  const result = await likeServices.un_like_SV( user_id, req.params.tweet_id )
  return res.json({
    message: LIKE_MESSAGES.UN_LIKE_SUCCESS,
  })
}