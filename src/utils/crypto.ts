import { createHash } from "crypto";

const sha256 = (content: string) => {
  return createHash('sha256').update(content).digest('hex')
}

const hasPassword = (pass: string) => {
  return sha256(pass + process.env.DB_PASSWORD_SECRET)
}

export default hasPassword