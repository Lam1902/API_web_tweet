import { handleUploadImage, handleUploadVideo } from "~/utils/file"
import e, { Request } from "express"
import sharp from "sharp"
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir"
import { getNameImage } from "~/utils/file"
import path, { resolve } from "path"
import fs from 'fs';
import { isProduction } from "~/utils/config"
import { EncodingStatus, MediaType } from "~/constants/enum"
import formidable from 'formidable';
import { encodeHLSWithMultipleVideoStreams } from "~/utils/video"
import databaseService from "./database.services"
import VideoStatus from "~/models/schemas/VideoStatus.schema"
import { ObjectId } from "mongodb"


class MediasService {
  constructor() {
  }
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req);

    // Xử lý các file được tải lên
    const result = await Promise.all(files.map(async (file) => {
      const newFileName = getNameImage(file.newFilename);
      const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newFileName}.jpg`);

      try {
        // Xử lý và lưu file ảnh
        await sharp(file.filepath).jpeg().toFile(newPath);

        // Xóa file trong thư mục temp sau khi đã xử lý xong
        fs.unlinkSync(file.filepath);

        // Trả về URL của file đã lưu trữ
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFileName}.jpg`
            : `http://localhost:3001/static/image/${newFileName}.jpg`,
          type: MediaType.Image
        };
      } catch (error) {
        console.error(`Error processing file ${file.filepath}: ${(error as any).message}`);
        // Xóa file nếu xảy ra lỗi trong quá trình xử lý
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        throw error; // Có thể ném lại lỗi hoặc xử lý theo cách khác
      }
    }));

    return result;
  }

  async saveVideo_SV(nameVideo: string) {
    databaseService.videoStatus.insertOne(
      new VideoStatus({
        _id: new ObjectId(), // Assuming you are generating an ObjectId
        nameVideo,
        status: EncodingStatus.Success, // Assuming you have a valid enum or value for status
        message: "Upload Video success",
        created_at: new Date(),
        updated_at: new Date()
      })
    )
  }

  async updateVideo_SV(nameVideo: string, status: EncodingStatus, message: string) {
    databaseService.videoStatus.updateOne(
      { nameVideo },
      {
        $set: {
          status,
          message,
          updated_at: new Date()
        }
      }
    )
  }

  async handleUploadVideoSV(req: Request) {
    try {
      const files = await handleUploadVideo(req);
      const { newFilename } = files;
      await this.saveVideo_SV(newFilename)
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${newFilename}`
          : `http://localhost:3001/static/video/${newFilename}`,
        type: MediaType.Video
      };
    } catch (error) {
      console.error("Error in handleUploadVideoSV:", error);
      // You can throw a custom error or return a default error response
      throw new Error("Failed to upload video. Please try again.");
    }
  }


  async handleUploadVideoHLS_SV(req: Request) {
    const files = await handleUploadVideo(req);
    const { newFilename } = files
    await encodeHLSWithMultipleVideoStreams(files.filepath)
    await this.saveVideo_SV(newFilename)
    return {
      url: isProduction
        ? `${process.env.HOST}/static/video/${newFilename}`
        : `http://localhost:3001/static/video/${newFilename}`,
      type: MediaType.Video
    };
  }

  async getVideoStatus_SV (id: string) {
    const result = await databaseService.videoStatus.findOne({ nameVideo: id })
    console.log(id)
    return result
  }

}

const mediasService = new MediasService()

export default mediasService