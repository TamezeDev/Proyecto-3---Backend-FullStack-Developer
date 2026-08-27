import { verifyToken } from '../../utils/tokenSession.js'
import { User } from '../../src/models/user.model.js'
import {
  AuthError,
  ForbiddenError,
  ValidationError,
} from '../errors/app.error.js'

// Middleware to check if jwt is valid and checking if role matches with sent it
export const isAuth = (...allowedRoles) => {
  return async (req, _res, next) => {
    try {
      const jwt = req.headers.authorization?.split(' ')[1]
      if (!jwt) return next(new ValidationError('Token de sesión requerido'))

      let decoded

      try {
        decoded = verifyToken(jwt)
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return next(
            new AuthError(
              'Tu sesión ha caducado, cierra tu sesión actual y haz login de nuevo'
            )
          )
        }
        return next(new AuthError('Token de sesión inválido'))
      }

      req.body = req.body || {}
      req.body.userId = decoded.id

      const userDb = await User.findById(decoded.id)
      if (!userDb) return next(new ForbiddenError())
      if (allowedRoles.length > 0 && !allowedRoles.includes(userDb.role))
        return next(new AuthError())
      next()
    } catch (error) {
      next(new AuthError(error))
    }
  }
}
