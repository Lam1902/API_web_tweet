import { ObjectId } from "mongodb";
import { EncodingStatus } from "~/constants/enum";


export default class VideoStatus {
  _id: ObjectId
  nameVideo: string
  status: EncodingStatus
  message: string
  created_at: Date
  updated_at: Date

  constructor({ _id, nameVideo, status, message, created_at, updated_at }:
    { _id: ObjectId, nameVideo: string, status: EncodingStatus, message: string, created_at: Date, updated_at: Date }) {
    const date = new Date()
    this._id = _id
    this.nameVideo = nameVideo
    this.status = status
    this.message = message || ''
    this.created_at = date
    this.updated_at = date

  }
}