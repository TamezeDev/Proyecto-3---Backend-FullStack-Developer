import { User } from '../../src/models/user.model.js'
import { ForbiddenError, AppError } from '../errors/app.error.js'

// Middleware to check if user has an active premium account
const isPremium = async (req, _res, next) => {
  try {
    const userId = req.body.userId
    const user = await User.findById(userId).populate('premiumAccount')
    if (!user || !user.premiumAccount)
      return next(
        new ForbiddenError(
          'Necesitas una cuenta premium para realizar esta acción'
        )
      )

    const premiumAccount = user.premiumAccount
    const isExpired = premiumAccount.nextPaymentDate < new Date()

    if (isExpired && premiumAccount.isPremiumNow) {
      premiumAccount.isPremiumNow = false
      await premiumAccount.save()
    }

    if (!premiumAccount.isPremiumNow)
      return next(
        new ForbiddenError(
          'Tu cuenta premium ha caducado, renueva el pago para continuar leyendo'
        )
      )

    next()
  } catch (error) {
    next(
      new AppError(
        'Error comprobando el estado premium del usuario -> ' + error
      )
    )
  }
}

export { isPremium }
