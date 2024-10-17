import { NextFunction, Request, Response } from "express";

// hàm chạy func và nếu có lỗi sẽ đẩy lỗi sang func xử lí lỗi
export const wrapRequestHandler = (func: any) => {
  return async (req :Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}