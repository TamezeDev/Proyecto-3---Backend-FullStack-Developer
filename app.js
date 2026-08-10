import express from 'express'
import {
  unexpectedError,
  notFoundError,
} from './shared/middlewares/error.middleware.js'
const app = express()

const initBackend = async () => {
  app.use(express.json())
  // Middlewares
  app.use(notFoundError)
  app.use(unexpectedError)
}

export { initBackend, app }
