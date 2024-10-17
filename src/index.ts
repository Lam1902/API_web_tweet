import express from 'express'
import userRouter from './routes/user.routes'
import databaseService from './services/database.services'
import bodyParser from 'body-parser'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { mediaRouter } from './routes/media.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import { staticRouter } from './routes/static.routes'
import { tweetsRouter } from './routes/tweets.routes'
import { bookmarkRouter } from './routes/bookmark.routes'
import { likeRouter } from './routes/like.routes'

config()

const app = express()
const port = process.env.PORT || 1902
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollower()
})


initFolder() // check các folder , nếu chưa có thì tạo

app.use(express.json())
app.use(bodyParser.json());

initFolder()

console.log(UPLOAD_IMAGE_DIR)

app.use('/api', userRouter, mediaRouter)
app.use('/api/tweets', tweetsRouter)
app.use('/api/bookmarks', bookmarkRouter)
app.use('/api/likes', likeRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler);




app.listen(port, () => {
  console.log(`Twitter app listening on port ${port}`)
})


