import { ObjectId } from "mongodb";
import { TweetType } from "~/constants/enum";
import { TweetAudience } from "~/constants/enum";
import { Media } from "../Other";


interface TweetConstructor {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: string | null; // optional or null for tweet threads
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: Media[]; // Assuming Media is a defined type elsewhere
  guest_views: number;
  user_views?: number;
  created_at?: Date;
  updated_at?: Date;
}

export default class Tweet {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: ObjectId | null; // optional or null for tweet threads
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: Media[]; // Assuming Media is a defined type elsewhere
  guest_views: number;
  user_views?: number;
  created_at?: Date;
  updated_at?: Date;
  constructor({ _id, user_id, type, audience, content, parent_id, hashtags, mentions, medias, guest_views, user_views, created_at, updated_at }: TweetConstructor) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id ? new ObjectId(parent_id) : null
    this.hashtags = hashtags
    this.mentions = mentions.map((mention) => new ObjectId(mention))
    this.medias = medias
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }

}