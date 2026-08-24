import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AuthError } from '../../shared/errors/app.error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })
const CRON_SECRET = process.env.CRON_SECRET

// Middleware to check if authorization is valid for run cron
export const isCronAuth = (req, _res, next) => {
  try {
    const authHeader = req.headers['authorization']
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return next(new AuthError('No autorizado para hacer esta operación'))
    }
    next()
  } catch (error) {
    next(new AuthError(error))
  }
}
