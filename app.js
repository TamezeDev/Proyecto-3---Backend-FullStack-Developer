import express from 'express'
import {
  unexpectedError,
  notFoundError,
} from './shared/middlewares/error.middleware.js'
import { connect } from './config/database.config.js'

const app = express()

const initBackend = async () => {
  // Conecction
  connect()
  app.use(express.json())
  // Middlewares
  app.use(notFoundError)
  app.use(unexpectedError)
}

export { initBackend, app }
