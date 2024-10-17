import fs from 'fs'
import formidable from "formidable"
import { IncomingMessage } from 'http';
import { Request } from 'express';
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  [UPLOAD_IMAGE_TEMP_DIR,UPLOAD_VIDEO_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_IMAGE_DIR ].forEach(folder => {
    if(!fs.existsSync(folder)){
      fs.mkdirSync(folder, { recursive: true }) 
    }
  } )
}

export const handleUploadImage = (req: Request) => {
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300kb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'));
      return valid;
    },

  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(new Error('File upload failed: ' + err.message));
        return;
      }

      if (!files.image) {
        reject(new Error('Invalid file type or file is empty'));
        return;
      }
      resolve(files.image as File[])
    })
  })

}

export const getNameImage = (FullFileName: string) => {
  const fileName = FullFileName.split('.')
  fileName.pop()
  return fileName.join('')
}

export const getExtension = (FullFileName: string) => {
  const fileName = FullFileName.split('.')
  return fileName[fileName.length - 1]
}


export const handleUploadVideo = (req: Request) => {
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50Mb
    filter: function ({ name, mimetype }) {
      return true
    },

  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req as IncomingMessage, (err, fields, files) => {
      if (err) {
        return reject(new Error('File upload failed: ' + err.message));
      }

      // Lấy file video từ đối tượng files
      const videoFile = files.video;

      // Kiểm tra nếu videoFile là một mảng
      if (Array.isArray(videoFile)) {
        // Nếu là mảng, lấy file đầu tiên (trường hợp `maxFiles` > 1)
        videoFile.forEach(video => {
          const ext = getExtension(video.originalFilename as string )  
          fs.renameSync(video.filepath, video.filepath + '.' +ext)
          video.newFilename = video.newFilename+ '.'+ ext
          video.filepath = video.filepath + '.' + ext
        })
        resolve(videoFile[0]);
      } else if (videoFile) {
        // Nếu không phải là mảng, trả về file
        const file = videoFile as formidable.File
        const ext = getExtension(file.originalFilename as string);
        fs.renameSync(file.filepath, file.filepath + '.' + ext)
        file.newFilename = file.newFilename + '.' + ext
        file.filepath = file.filepath + '.' + ext
        resolve(file);
      } else {
        reject(new Error('Invalid file type or file is empty'));
      }
    });
  });
}