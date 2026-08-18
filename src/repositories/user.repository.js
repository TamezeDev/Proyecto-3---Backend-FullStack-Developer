import { User } from '../models/user.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import {
  isBody,
  bodyValidToRegisterUser,
  bodyValidToLogin,
  bodyValidToChangePass,
} from '../../utils/bodyRequirements.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../../utils/tokenSession.js'
import { deleteImgCloudinary } from '../../utils/cloudinary.utils.js'

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

// Get all user
const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find()
      .populate({
        path: 'reading',
        populate: [{ path: 'book', model: 'Book' }],
      })
      .populate({
        path: 'library',
        populate: [{ path: 'book', model: 'Book' }],
      })
      .populate('premiumAccount')
      .populate('cardPayments')

    if (users.length === 0)
      return next(new NotFoundError('La lista de usuarios está vacía'))
    res
      .status(200)
      .json({ message: 'Mostrando lista de usuarios', data: users })
  } catch (error) {
    next(new AppError('Error obteniendo datos de los usuarios -> ' + error))
  }
}

// Add or modify profile user image
const modifyProfileImg = async (req, res, next) => {
  try {
    const image = req.file

    if (!image) {
      return next(new ValidationError('Es necesario adjuntar una imagen'))
    }

    const user = await User.findById(req.body.userId)
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const oldImageId = user.imageProfileId

    const updated = await User.findByIdAndUpdate(
      req.body.userId,
      { imageProfileUrl: image.path, imageProfileId: image.filename },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    )

    if (oldImageId) deleteImgCloudinary(oldImageId)

    res
      .status(200)
      .json({ message: 'Imagen de perfil modificada correctamente', updated })
  } catch (error) {
    next(
      new AppError(
        'Error actualizando imagen de perfil del usuario -> ' + error
      )
    )
  }
}

// Add new card payment
const addUserCard = async (userId, cardId, next) => {
  if (!cardId)
    return next(
      new ValidationError(
        'Es necesario adjuntar los datos de la tarjeta guardados'
      )
    )

  const user = await User.findById(userId)
  if (!user)
    return next(new NotFoundError('El usuario no se encuentra en el servidor'))

  const cardslist = user.cardPayments
  const hadUserCard = cardslist.includes(cardId.toString())
  if (hadUserCard)
    return next(
      new ValidationError('La tarjeta ya está registrada en su lista')
    )

  cardslist.push(cardId)

  const updated = await User.findByIdAndUpdate(
    userId,
    { cardPayments: cardslist },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  )
  if (!updated)
    return next(
      new InsertError('Error guardando la tarjeta en la lista del usuario')
    )
}

export {
  createUser,
  login,
  modifyPassword,
  getUsers,
  modifyProfileImg,
  addUserCard,
}
