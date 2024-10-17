
import { ObjectId } from "mongodb"

interface FollowerType {
  _id?: ObjectId
  user_id: Object
  follow_id: Object
}

export class Follower {
  _id?: ObjectId
  user_id: Object
  follow_id: Object
  constructor({_id, user_id, follow_id}: FollowerType) {
    this._id = _id
    this.user_id = user_id
    this.follow_id = follow_id
  }
}