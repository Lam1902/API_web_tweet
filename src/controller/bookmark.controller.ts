
import { Request, Response, NextFunction } from "express"
import { BOOKMARK_MESSAGES } from "~/constants/message"
import bookmarkServices from "~/services/bookmark.services"


export const bookmarkController = async (req: Request, res: Response, next: NextFunction) => {
  const {user_id} = req.decode_authorization as {user_id: string}

  const result = await bookmarkServices.createBookmark_SV( user_id, req.body.tweet_id )
  return res.json({
    message: BOOKMARK_MESSAGES.CREATE_BOOKMARK_SUCCESS,
    result
  })
}

export const un_bookmarkController = async (req: Request, res: Response, next: NextFunction) => {
  const {user_id} = req.decode_authorization as {user_id: string}

  const result = await bookmarkServices.deleteBookmark_SV( user_id, req.params.tweet_id )
  return res.json({
    message: BOOKMARK_MESSAGES.UN_BOOKMARK_SUCCESS,
  })
}