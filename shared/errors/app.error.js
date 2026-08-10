class AppError extends Error {
  constructor(message, status = 500) {
    ;(super(message),
      (this.status = status),
      Error.captureStackTrace(this, this.constructor))
  }
}

class InsertError extends AppError {
  constructor(message = 'Insert data error') {
    super(message, 422)
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
  }
}

class AuthError extends AppError {
  constructor(message = "You don't have enough permission") {
    super(message, 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Your access has been denied') {
    super(message, 403)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404)
  }
}

export {
  AppError,
  InsertError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
}
