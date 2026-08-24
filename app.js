import express from 'express'
import cors from 'cors'
import {
  unexpectedError,
  notFoundError,
} from './shared/middlewares/error.middleware.js'
import { connect } from './config/database.config.js'
import userRoutes from './src/routes/user.routes.js'
import libraryRoutes from './src/routes/library.routes.js'
import readingRoutes from './src/routes/reading.routes.js'
import cardPaymentRoutes from './src/routes/cardPayment.routes.js'
import premiumAccountRoutes from './src/routes/premiumAccount.routes.js'
import premiumPricesRoutes from './src/routes/premiumPrice.routes.js'
import bookRoutes from './src/routes/book.routes.js'
import cronRoutes from './src/routes/cron.routes.js'

const BASE_URL = '/api/v1'
const app = express()

// Conecction
await connect()
app.use(cors())
app.use(express.json())
// Endpoints
app.use(`${BASE_URL}/users`, userRoutes)
app.use(`${BASE_URL}/users`, libraryRoutes)
app.use(`${BASE_URL}/users`, readingRoutes)
app.use(`${BASE_URL}/cards`, cardPaymentRoutes)
app.use(`${BASE_URL}/premium`, premiumAccountRoutes)
app.use(`${BASE_URL}/plans`, premiumPricesRoutes)
app.use(`${BASE_URL}/books`, bookRoutes)
app.use(`${BASE_URL}/cron`, cronRoutes)
// Middlewares
app.use(notFoundError)
app.use(unexpectedError)

export default app
