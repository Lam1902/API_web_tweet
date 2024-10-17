import { Router } from "express";
import { serveImageController,serveVideoStreamController } from "~/controller/media.controller";
import { wrapRequestHandler } from "~/middlewares/handlers";

export const staticRouter = Router()

staticRouter.get('/image/:name', wrapRequestHandler(serveImageController))
staticRouter.get('/video-stream/:name', wrapRequestHandler(serveVideoStreamController))
