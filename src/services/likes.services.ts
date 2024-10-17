import databaseService from "./database.services"
import { ObjectId } from "mongodb"
import Likes from "~/models/schemas/Like.schema"

class LikeServices {
  async like_SV(userId: string, tweetId: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      { user_id: new ObjectId(userId), tweet_id: new ObjectId(tweetId) },
      {
        $setOnInsert: new Likes({
          user_id: new ObjectId(userId),
          tweet_id: new ObjectId(tweetId),
        })
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    )
    console.log("🚀 ~ LikeServices ~ like_SV ~ result:", result)
    return result
  }

  async un_like_SV(userId: string, tweetId: string) {

    const result = await databaseService.likes.findOneAndDelete(
      {
        user_id: new ObjectId(userId),
        tweet_id: new ObjectId(tweetId)
      }
    );

    if (!result) {
      return null;
    }

    return result;
  }

}


const likeServices = new LikeServices()

export default likeServices


