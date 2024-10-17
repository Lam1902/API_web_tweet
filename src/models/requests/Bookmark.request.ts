import { ObjectId } from "mongodb";

export interface BookmarkRequestBody {
  user_id: ObjectId
  tweet_id: ObjectId
 
}