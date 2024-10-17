
import { ObjectId } from "mongodb"


interface BookmarkType {
  _id?: ObjectId
  user_id: Object
  tweet_id: Object
  created_at?: Date
  updated_at?: Date
}

export default  class Bookmark {
  _id?: ObjectId 
  user_id: Object
  tweet_id: Object
  created_at?: Date
  updated_at?: Date
  constructor({ _id, user_id, tweet_id, created_at, updated_at }: BookmarkType) {
    const date = new Date()
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}