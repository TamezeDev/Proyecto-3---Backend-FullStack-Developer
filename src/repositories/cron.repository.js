import { startPremiumExpirationTask } from '../../shared/tasks/premiumExpiration.task.js'
import { AppError, ValidationError } from '../../shared/errors/app.error.js'

export const expirePremiumAccounts = async (_req, res, next) => {
  try {
    const result = await startPremiumExpirationTask()

    if (result === undefined || result === null)
      return next(
        new ValidationError('❌ Error actualizando cuentas premium caducadas')
      )

    res.status(200).json({ ok: true, updated: result })
  } catch (error) {
    next(
      new AppError(
        'Error limpiando cuentas premium de usuarios caducadas -> ' + error
      )
    )
  }
}
