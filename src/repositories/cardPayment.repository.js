import { CardPayment } from '../models/cardPayment.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
  DeleteError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import {
  addUserCard,
  globalDeleteCard,
  userHasCard,
} from './user.repository.js'

import {
  isBody,
  bodyValidToRegisterCard,
  bodyValidToAddCreditCard,
} from '../../utils/bodyRequirements.js'

// Create new card
export const newCard = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToRegisterCard(body))
      return next(
        new ValidationError(
          'Faltan campos obligatorios en el registro de la tarjeta'
        )
      )

    let card = await CardPayment.findOne({ numberCard: body.numberCard })
    if (!card) card = await CardPayment.create(body)

    if (!card)
      return next(
        new InsertError('No se pudo insertar la tarjeta en el servidor')
      )
    await addUserCard(body.userId, card._id)

    res
      .status(201)
      .json({ message: 'Tarjeta registrada con éxito', data: card })
  } catch (error) {
    if (
      error.status ||
      error.name === 'ValidationError' ||
      error.name === 'NotFoundError'
    ) {
      return next(error)
    }
    next(
      new AppError(
        'Error inesperado en el registro de una nueva tarjeta -> ' + error
      )
    )
  }
}

// Delete card from server(only admins)
export const deleteCardPayment = async (req, res, next) => {
  try {
    const cardId = req.params.id

    const cardDeleted = await CardPayment.findByIdAndDelete(cardId)
    if (!cardDeleted)
      return next(
        new DeleteError(
          'No se ha encontrado el id de la tarjeta en el servidor'
        )
      )
    const impliedUsers = await globalDeleteCard(cardId)

    res.status(200).json({
      message: 'Tarjeta eliminada del servidor completamente',
      data: cardDeleted,
      impliedUsers,
    })
  } catch (error) {
    next(new AppError('Error eliminando la tarjeta del servidor -> ' + error))
  }
}

// Increase quantity selected in card
export const addCreditToCard = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToAddCreditCard(body))
      return next(
        new ValidationError(
          'Formato incorrecto de los datos necesarios para realizar esta operación'
        )
      )

    const cardId = req.params.id

    await userHasCard(body.userId, cardId)

    const cardUpdated = await CardPayment.findByIdAndUpdate(
      cardId,
      {
        $inc: { credit: body.quantity },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    )
    if (!cardUpdated)
      return next(
        new NotFoundError('No se pudo actualizar el crédito en su tarjeta')
      )
    res.status(200).json({
      message: 'Crédito añadido con éxito a la tarjeta',
      data: cardUpdated,
    })
  } catch (error) {
    if (error.status || error.name === 'NotFoundError') {
      return next(error)
    }
    next(new AppError('Error añadiendo crédito a la tarjeta -> ' + error))
  }
}

// Decrease credit after payment
export const doPremiumPayment = async (userId, cardId, quanty, session) => {
  if (!userId || !cardId || !quanty)
    throw new ValidationError('Los datos enviados no son válidos')

  await userHasCard(userId, cardId, session)

  const card = await CardPayment.findById(cardId).session(session)
  if (!card) throw new NotFoundError('Tarjeta no encontrada')
  if (card.credit < quanty)
    throw new ValidationError('Saldo insuficiente para realizar el pago')

  const cardPayment = await CardPayment.findByIdAndUpdate(
    cardId,
    { $inc: { credit: -quanty } },
    { returnDocument: 'after', runValidators: true, session }
  )
  if (!cardPayment) throw new NotFoundError('No se pudo efectuar el pago')
}

// Get all cards (only by admins)
export const getAllCards = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50)
    const skip = (page - 1) * limit

    const [cards, totalCards] = await Promise.all([
      CardPayment.find()
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit),
      CardPayment.countDocuments(),
    ])

    if (cards.length === 0)
      return next(new NotFoundError('No se encontraron tarjetas registradas'))

    const totalPages = Math.ceil(totalCards / limit)

    res.status(200).json({
      message: 'Mostrando lista de tarjetas',
      data: cards,
      pagination: {
        page,
        limit,
        totalCards,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error) {
    next(new AppError('Error obteniendo el listado de tarjetas -> ' + error))
  }
}
