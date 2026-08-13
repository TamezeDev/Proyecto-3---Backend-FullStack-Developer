import express from 'express'
import {
  unexpectedError,
  notFoundError,
} from './shared/middlewares/error.middleware.js'
import { connect } from './config/database.config.js'
import userRoutes from './src/routes/user.routes.js'

const app = express()

const initBackend = async () => {
  // Conecction
  connect()
  app.use(express.json())
  // Endpoints
  app.use('/api/v1/users', userRoutes)
  // Middlewares
  app.use(notFoundError)
  app.use(unexpectedError)
}

export { initBackend, app }
