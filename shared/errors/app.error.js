class AppError extends Error {
  constructor(message, status = 500) {
    ;(super(message),
      (this.status = status),
      Error.captureStackTrace(this, this.constructor))
  }
}

class InsertError extends AppError {
  constructor(message = 'Error insertando datos en la base de datos') {
    super(message, 422)
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
  }
}

class AuthError extends AppError {
  constructor(message = 'No autorizado para hacer esta operación') {
    super(message, 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso no permitido') {
    super(message, 403)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'No se ha encontrado') {
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
