import { TweetAudience, TweetType } from "~/constants/enum";
import { ObjectId } from "mongodb";
import { Media } from "../Other";

export interface TweetRequestBody {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: string | null; // optional or null for tweet threads
  hashtags: string[];
  mentions: ObjectId[];
  medias: Media[]; // Assuming Media is a defined type elsewhere
  guest_views: number;
  user_views?: number;
  created_at?: Date;
  updated_at?: Date;
}