import { PremiumPrice } from '../models/premiumPrice.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import {
  isBody,
  bodyValidToCreatePremiumPlan,
  bodyValidToUpdatePremiumPlan,
} from '../../utils/bodyRequirements.js'

// Get premium plan data for the payment
const getPlanForPayment = async (namePlan, session) => {
  if (!namePlan)
    throw new ValidationError(
      'Debe enviar el nombre del plan que quieres contratar'
    )

  const planData = await PremiumPrice.findOne({ name: namePlan }).session(
    session
  )
  if (!planData)
    throw new NotFoundError(
      'El plan seleccionado no se encuentra en nuestra base de datos'
    )
  return planData
}

// Create a new premium plan
const createPremiumPlan = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(
        new ValidationError('Error: El cuerpo de la petición está vacío')
      )

    if (!bodyValidToCreatePremiumPlan(body))
      return next(
        new ValidationError(
          'Error: Faltan campos obligatorios para crear el plan'
        )
      )

    const planExists = await PremiumPrice.findOne({ name: body.name })
    if (planExists)
      return next(
        new ValidationError('Error: Ya existe un plan con ese nombre')
      )

    const newPlan = await PremiumPrice.create(body)
    if (!newPlan)
      return next(
        new InsertError('Error: No se pudo insertar el plan en el servidor')
      )

    res
      .status(201)
      .json({ message: 'Plan premium creado con éxito', data: newPlan })
  } catch (error) {
    next(new AppError('Error inesperado creando el plan premium -> ' + error))
  }
}

// Delete a premium plan
const deletePremiumPlan = async (req, res, next) => {
  try {
    const planId = req.params.id

    if (!planId) return next(new ValidationError('Error: Id de plan requerido'))

    const deletedPlan = await PremiumPrice.findByIdAndDelete(planId)
    if (!deletedPlan)
      return next(
        new NotFoundError('El plan premium no se encuentra en el servidor')
      )

    res.status(200).json({
      message: 'Plan premium eliminado con éxito',
      data: deletedPlan,
    })
  } catch (error) {
    next(new AppError('Error eliminando el plan premium -> ' + error))
  }
}

// Modify name, price and/or duration of a premium plan
const updatePremiumPlan = async (req, res, next) => {
  try {
    const planId = req.params.id
    const body = req.body

    if (!planId) return next(new ValidationError('Error: Id de plan requerido'))

    if (!isBody(body))
      return next(
        new ValidationError('Error: El cuerpo de la petición está vacío')
      )

    if (!bodyValidToUpdatePremiumPlan(body))
      return next(
        new ValidationError(
          'Error: Debes enviar al menos un campo a modificar (nombre, precio o duración)'
        )
      )

    const fieldsToUpdate = {}
    if (body.name) fieldsToUpdate.name = body.name
    if (body.price) fieldsToUpdate.price = body.price
    if (body.durationMonths) fieldsToUpdate.durationMonths = body.durationMonths

    const updatedPlan = await PremiumPrice.findByIdAndUpdate(
      planId,
      fieldsToUpdate,
      { returnDocument: 'after', runValidators: true }
    )
    if (!updatedPlan)
      return next(
        new NotFoundError('El plan premium no se encuentra en el servidor')
      )

    res.status(200).json({
      message: 'Plan premium modificado con éxito',
      data: updatedPlan,
    })
  } catch (error) {
    next(new AppError('Error modificando el plan premium -> ' + error))
  }
}

// Get all premium plans
const getPremiumPlans = async (_req, res, next) => {
  try {
    const plans = await PremiumPrice.find()

    if (plans.length === 0)
      return next(new NotFoundError('La lista de planes premium está vacía'))

    res
      .status(200)
      .json({ message: 'Mostrando lista de planes premium', data: plans })
  } catch (error) {
    next(new AppError('Error obteniendo los planes premium -> ' + error))
  }
}

export {
  createPremiumPlan,
  deletePremiumPlan,
  updatePremiumPlan,
  getPremiumPlans,
  getPlanForPayment,
}
