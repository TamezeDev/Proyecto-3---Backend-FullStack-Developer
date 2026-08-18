import { User } from '../models/user.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
} from '../../shared/errors/app.error.js'
import {
  isBody,
  bodyValidToRegisterUser,
  bodyValidToLogin,
  bodyValidToChangePass,
} from '../../utils/bodyRequirements.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../../utils/tokenSession.js'

// Create a new user account
const createUser = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(new AppError('Error inesperado en el registro de usuario -> ' + error))
  }
}

// Check credentials and generate a new session token
const login = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(
        new ValidationError('Error: El cuerpo de la petición está vacío')
      )

    if (!bodyValidToLogin(body))
      return next(
        new ValidationError(
          'Error: Faltan campos obligatorios en el login de usuario'
        )
      )

    const userFound = await User.findOne({ email: body.email }).select(
      '+password'
    )
    let matchPass

    if (userFound) {
      const bodyPass = body.password
      const encodePass = userFound.password
      matchPass = await bcrypt.compare(bodyPass, encodePass)
    }

    if (!userFound || !matchPass)
      return next(
        new ValidationError('Error: Email de usuario o contraseña incorrectos')
      )

    const sessionToken = generateToken(userFound._id)
    return res
      .status(200)
      .json({ message: 'Login realizado con éxito', sessionToken })
  } catch (error) {
    next(new AppError('Error inesperado en el login de usuario -> ' + error))
  }
}

// Change current password encoding the new one
const modifyPassword = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(
        new ValidationError('Error: El cuerpo de la petición está vacío')
      )

    if (!bodyValidToChangePass(body))
      return next(
        new ValidationError(
          'Error: Faltan campos obligatorios para el cambio de contraseña'
        )
      )

    if (body.newPass !== body.repeatNewPass)
      return next(new ValidationError('Error: Las contraseñas no coinciden'))

    const user = await User.findById(body.userId).select('+password')
    const matchCurrentPass = await bcrypt.compare(
      body.currentPass,
      user.password
    )
    if (!matchCurrentPass)
      return next(
        new ValidationError('Error: La contraseña actual no coincide')
      )

    user.password = body.newPass
    const updated = await user.save()
    updated.password = undefined

    res
      .status(200)
      .json({ message: 'Contraseña modificada con éxito', data: updated })
  } catch (error) {
    next(new AppError('Error modificando contraseña de usuario -> ' + error))
  }
}

export { createUser, login, modifyPassword }
