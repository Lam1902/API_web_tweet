import { Router } from "express";
import { bookmarkController, un_bookmarkController } from "~/controller/bookmark.controller";
import { wrapRequestHandler } from "~/middlewares/handlers";
import { accessTokenValidator, verifyAccountValidator } from "~/middlewares/user.middleware";
import { tweetIdValidator } from "~/middlewares/tweets.middlewares";

export const bookmarkRouter = Router()

bookmarkRouter.post('/', accessTokenValidator, verifyAccountValidator , tweetIdValidator , wrapRequestHandler(bookmarkController))
bookmarkRouter.delete('/tweets/:tweet_id', accessTokenValidator, verifyAccountValidator , tweetIdValidator, wrapRequestHandler(un_bookmarkController))

