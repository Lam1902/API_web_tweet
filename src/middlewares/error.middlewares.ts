import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import {omit} from 'lodash'
import { ErrorWithStatus } from '~/models/Errors';

export const defaultErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if(err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']) )
  }

  Object.getOwnPropertyNames(err).forEach( (key) => {
    Object.defineProperty(err, key, {enumerable: true})
  } )

  const statusCode =  HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorResponse = omit(err, ['status']);
  res.status(statusCode).json({
    message: err.message,
    errInfo: err
  });
}
