import express from 'express'
import { body, validationResult, ContextRunner } from 'express-validator'
import { HTTP_STATUS } from '~/constants/httpStatus' 
import { EntityError, ErrorWithStatus } from '~/models/Errors'

export const validate = (validations: ContextRunner[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req)
    if(errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()
    const entityError = new EntityError({errors: {}})

    for (const key in errorsObject) {
      const {msg} = errorsObject[key]
      // trả về lỗi không phải do validate
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }

      entityError.errors[key] = msg
    }
    next(entityError)

  }
}
