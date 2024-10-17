import { create } from "axios";
import { Router } from "express";
import { wrapRequestHandler } from "~/middlewares/handlers";
import { accessTokenValidator, verifyAccountValidator } from "~/middlewares/user.middleware";
import { createTweetController , getTweetsController, getTweetsChildrenController} from "~/controller/tweets.controller";
import { createTweetValidator } from "~/middlewares/tweets.middlewares";
import { tweetIdValidator } from "~/middlewares/tweets.middlewares";
import { audienceValidator } from "~/middlewares/tweets.middlewares";

export const tweetsRouter = Router()

tweetsRouter.post('/', accessTokenValidator, verifyAccountValidator, createTweetValidator ,wrapRequestHandler(createTweetController))
tweetsRouter.get('/:tweet_id', accessTokenValidator, tweetIdValidator,audienceValidator, wrapRequestHandler(getTweetsController))
tweetsRouter.get('/tweets_children/:tweet_id', accessTokenValidator, tweetIdValidator,audienceValidator, wrapRequestHandler(getTweetsChildrenController))