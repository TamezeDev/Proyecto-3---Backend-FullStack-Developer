import { CardPayment } from '../models/cardPayment.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import { addUserCard } from './user.repository.js'

import {
  isBody,
  bodyValidToRegisterCard,
} from '../../utils/bodyRequirements.js'

// Create new card
export const newCard = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(
        new ValidationError('Error: El cuerpo de la petición está vacío')
      )

    if (!bodyValidToRegisterCard(body))
      return next(
        new ValidationError(
          'Error: Faltan campos obligatorios en el registro de la tarjeta'
        )
      )

    let card = await CardPayment.findOne({ numberCard: body.numberCard })
    if (!card) card = await CardPayment.create(body)

    if (!card)
      return next(
        new InsertError('Error: No se pudo insertar la tarjeta en el servidor')
      )
    await addUserCard(body.userId, card._id, next)

    res
      .status(201)
      .json({ message: 'Tarjeta registrada con éxito', data: card })
  } catch (error) {
    next(
      new AppError(
        'Error inesperado en el registro de una nueva tarjeta -> ' + error
      )
    )
  }
}
