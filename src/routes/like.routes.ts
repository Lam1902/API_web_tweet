import { Router } from "express";
import { wrapRequestHandler } from "~/middlewares/handlers";
import { accessTokenValidator, verifyAccountValidator } from "~/middlewares/user.middleware";
import { likeController , un_likeController} from "~/controller/like.controller";
import { tweetIdValidator } from "~/middlewares/tweets.middlewares";

export const likeRouter = Router()

likeRouter.post('/', accessTokenValidator, verifyAccountValidator, tweetIdValidator,  wrapRequestHandler(likeController))
likeRouter.delete('/likes/:tweet_id', accessTokenValidator, verifyAccountValidator , tweetIdValidator, wrapRequestHandler(un_likeController))
