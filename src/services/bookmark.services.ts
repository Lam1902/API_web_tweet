import databaseService from "./database.services"
import { ObjectId } from "mongodb"
import Bookmark from "../models/schemas/Bookmark.schema"

class BookmarkServices {
  async createBookmark_SV(userId: string, tweetId: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      { user_id: new ObjectId(userId), tweet_id: new ObjectId(tweetId) },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(userId),
          tweet_id: new ObjectId(tweetId),
        })
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    )
    console.log("🚀 ~ BookmarkServices ~ createBookmark_SV ~ result:", result)
    return result
  }

  async deleteBookmark_SV(userId: string, tweetId: string) {
    console.log("🚀 ~ BookmarkServices ~ deleteBookmark_SV ~ tweetId:", tweetId);

    const result = await databaseService.bookmarks.findOneAndDelete(
      {
        user_id: new ObjectId(userId),
        tweet_id: new ObjectId(tweetId)
      }
    );

    if (!result) {
      console.log("🚀 ~ BookmarkServices ~ deleteBookmark_SV: No bookmark found for the given user and tweet.");
      return null;  // Hoặc bạn có thể trả về thông báo lỗi hoặc giá trị thích hợp khác
    }

    return result;  // Trả về giá trị nếu đã xóa thành công
  }

}


const bookmarkServices = new BookmarkServices()

export default bookmarkServices


