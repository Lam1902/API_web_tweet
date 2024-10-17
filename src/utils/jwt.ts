import jwt from 'jsonwebtoken'
import { SignOptions } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'


interface SignTokenParams {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: SignTokenParams): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        return reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = (
  {
  token,
  secretOrPublicKey
}: {
  token: string
  secretOrPublicKey: string
}) : Promise<string | object> => {
  return new Promise( (resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decode) => {
      if(err) {
        throw reject(err)
      }
      resolve(decode as string | object)

    })
  }
)
}
