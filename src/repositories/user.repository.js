import { User } from '../models/user.model.js'
import { ValidationError, InsertError } from '../../shared/errors/app.error.js'
import {
  isBody,
  bodyValidToRegisterUser,
} from '../../utils/bodyRequirements.js'

// Create a new user account
const createUser = async (req, res, next) => {
  const body = req.body

  if (!isBody(body))
    return next(
      new ValidationError('Error: El cuerpo de la petición está vacío')
    )

  if (!bodyValidToRegisterUser(body))
    return next(
      new ValidationError(
        'Error: Faltan campos obligatorios en el registro de usuario'
      )
    )

  const emailOnUse = await User.findOne({ email: body.email })

  if (emailOnUse)
    return next(new ValidationError('Error: El email ya está registrado'))

  const newUser = await User.create(body)
  if (!newUser)
    return next(
      new InsertError('Error: No se pudo insertar el usuario en el servidor')
    )

  res
    .status(201)
    .json({ message: 'Usuario registrado con éxito', data: newUser })
}

//

export { createUser }
