import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AppError } from '../shared/errors/app.error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

const allowedOrigins = (process.env.CORS_ADDRESS_ALLOWED || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export default cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new AppError('No permitido por CORS'))
    }
  },
  credentials: true,
})
