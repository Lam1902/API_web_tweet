
import { Request, Response, NextFunction } from "express"
import mediasService from "~/services/medias.services"
import { USERS_MESSAGES } from "~/constants/message"
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir"
import path from "path"
import fs from "fs"



export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadImage(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })

}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadVideoSV(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })

}


// controller cho image
export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;

    // Kiểm tra đường dẫn trước khi gửi file
    const filePath = path.resolve(UPLOAD_IMAGE_DIR, `${name}`);
    console.log(`Serving image: ${filePath}`);

    // Gửi file ảnh nếu tồn tại
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error serving file: ${err.message}`);
        return res.status((err as any).status || 404).send('Not found');
      }
    });
  } catch (error) {
    console.error(`Unexpected error: ${(error as any).message}`);
    return res.status(500).send('Internal Server Error');
  }
};


// controller cho video
export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = req.headers.range;
    if (!range) {
      return res.status(500).send('Required Range header');
    }

    const { name } = req.params

    // Kiểm tra đường dẫn trước khi gửi file
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, `${name}`);

    // 1MB = 10^6 bytes hệ thập phân
    const videoSize = fs.statSync(videoPath).size;
    // dung lượng cho mỗi phân đoạn video
    const chuckSize = 20 ** 6;
    // lấy giá trị bytes bắt đầu
    const start = Number(range.replace(/\D/g, ""));
    // lấy giá trị bytes kết thúc
    const end = Math.min(start + chuckSize, videoSize - 1);


    // dung lượng thực tế cho mỗi đoạn
    const contentLength = end - start + 1
    const contentType = 'video/*'
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    }

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);


    // Gửi file video nếu tồn tại
    res.sendFile(videoPath, (err) => {
      if (err) {
        console.error(`Error serving file: ${err.message}`);
        return res.status((err as any).status || 404).send('Not found');
      }
    });
  } catch (error) {
    console.error(`Unexpected error: ${(error as any).message}`);
    return res.status(500).send('Internal Server Error');
  }

  // const { name } = req.params
  // return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, `${name}`) , err => {
  //   if(err) {
  //     res.status((err as any).status).send('not found')
  //   }
  // })
};

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadVideoHLS_SV(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const VideoStatusController = async ( req: Request, res: Response, next: NextFunction ) => {
  const {id} = req.params
  console.log(id)
  const result = await mediasService.getVideoStatus_SV(id as string ) 
  return res.json({
    result
  })

}
