import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET_KEY, { expiresIn: '1d' })
}

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET_KEY)
}

export { generateToken, verifyToken }
