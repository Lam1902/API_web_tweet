
import { MongoClient, Db, Collection } from "mongodb";
import { config } from "dotenv";
import User from "~/models/database/User";
import { RefreshToken } from "~/models/requests/RequestToken.schema";
import { Follower } from "~/models/database/Follower";
import VideoStatus from "~/models/schemas/VideoStatus.schema";
import Tweet from "~/models/schemas/Tweet.schema";
import Hashtag from "~/models/schemas/Hashtag.shema";
import Bookmark from "~/models/schemas/Bookmark.schema";
import Likes from "~/models/schemas/Like.schema";

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-lamjs.tutolrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-LamJS`;

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      // Send a ping to confirm a successful connection
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
      console.log("🚀 ~ DatabaseService ~ connect ~ error:", error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESHTOKEN_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWER_COLLECTION as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARK_COLLECTION as string)
  }

  get likes(): Collection<Likes> {
    return this.db.collection(process.env.DB_LIKE_COLLECTION as string)
  }

  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'username_1', 'email_1'])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }

  }

  async indexRefreshTokens() {
    const exists = await this.users.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }
  async indexFollower() {
    const exists = await this.users.indexExists(['user_Id_1_follow_id_1'])
    this.followers.createIndex({ user_Id: 1, follow_id: 1 })
  }

}

const databaseService = new DatabaseService()
export default databaseService