import express from 'express'
import {
  unexpectedError,
  notFoundError,
} from './shared/middlewares/error.middleware.js'
import { connect } from './config/database.config.js'
import userRoutes from './src/routes/user.routes.js'
import cardPaymentRoutes from './src/routes/cardPayment.routes.js'

const BASE_URL = '/api/v1'
const app = express()

const initBackend = async () => {
  // Conecction
  await connect()
  app.use(express.json())
  // Endpoints
  app.use(`${BASE_URL}/users`, userRoutes)
  app.use(`${BASE_URL}/cards`, cardPaymentRoutes)
  // Middlewares
  app.use(notFoundError)
  app.use(unexpectedError)
}

export { initBackend, app }
