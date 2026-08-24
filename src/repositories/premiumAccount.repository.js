import mongoose from 'mongoose'
import { PremiumAccount } from '../models/premiumAccount.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
  UpdatingDataError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import {
  isBody,
  bodyValidToSetPremiumAccount,
} from '../../utils/bodyRequirements.js'
import { getPlanForPayment } from './premiumPrice.repository.js'
import { doPremiumPayment } from './cardPayment.repository.js'
import {
  getUserPremiumAccountId,
  setUserPremiumAccount,
} from './user.repository.js'

// Activate premium user account
export const setPremiumAccount = async (req, res, next) => {
  const session = await mongoose.startSession()
  try {
    const body = req.body

    if (!isBody(body))
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToSetPremiumAccount(body))
      return next(
        new ValidationError('Error de validación de los datos enviados')
      )

    const planSelected = await getPlanForPayment(body.plan, session)
    const nextPaymentDate = addMonthsToDate(
      new Date(),
      planSelected.durationMonths
    )

    let premiumAccount

    await session.withTransaction(async () => {
      await doPremiumPayment(
        body.userId,
        body.cardId,
        planSelected.price,
        session
      )

      const premiumAccountId = await getUserPremiumAccountId(
        body.userId,
        session
      )

      if (!premiumAccountId) {
        const created = await PremiumAccount.create(
          [
            {
              durationMonths: planSelected.durationMonths,
              nextPaymentDate,
              paymentDates: [new Date()],
            },
          ],
          { session }
        )
        premiumAccount = created[0]

        await setUserPremiumAccount(body.userId, premiumAccount._id, session)
      } else {
        premiumAccount = await PremiumAccount.findByIdAndUpdate(
          premiumAccountId,
          {
            isPremiumNow: true,
            durationMonths: planSelected.durationMonths,
            nextPaymentDate,
            $push: { paymentDates: new Date() },
          },
          { returnDocument: 'after', runValidators: true, session }
        )
      }

      if (!premiumAccount)
        throw new UpdatingDataError(
          'Error actualizando la cuenta premium de usuario'
        )
    })

    res.status(200).json({
      message: 'Pago de cuenta premium realizado con éxito',
      data: premiumAccount,
    })
  } catch (error) {
    if (
      error.status ||
      error.name === 'NotFoundError' ||
      error.name === 'ValidationError'
    ) {
      return next(error)
    }
    next(new AppError('Error activando cuenta premium -> ' + error))
  } finally {
    await session.endSession()
  }
}

/* ======================
    PRIVATE METHODS
========================*/
const addMonthsToDate = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}
