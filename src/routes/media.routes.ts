import { Router } from "express";
import { uploadImageController, uploadVideoController, uploadVideoHLSController, VideoStatusController } from "../controller/media.controller";
import { wrapRequestHandler } from "~/middlewares/handlers";
import { accessTokenValidator, refreshTokenValidator } from "~/middlewares/user.middleware";

export const mediaRouter = Router()

mediaRouter.post('/upload-image', accessTokenValidator, wrapRequestHandler(uploadImageController))
mediaRouter.post('/upload-video', accessTokenValidator, wrapRequestHandler(uploadVideoController))
mediaRouter.post('/upload-video-hls', accessTokenValidator, wrapRequestHandler(uploadVideoHLSController))
mediaRouter.get('/video-status/:id',accessTokenValidator, wrapRequestHandler(VideoStatusController))
