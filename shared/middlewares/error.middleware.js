import { NotFoundError } from '../errors/app.error.js'

const notFoundError = (_req, _res, next) => {
  next(new NotFoundError('Route not found'))
}

const unexpectedError = (error, _req, res, _next) => {
  const message = error.message || `Unexpected Error`
  const statusCode = error.status || 500
  return res.status(statusCode).json({ status: statusCode, error: message })
}

export { notFoundError, unexpectedError }
