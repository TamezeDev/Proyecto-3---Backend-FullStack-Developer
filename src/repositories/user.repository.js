import { User } from '../models/user.model.js'
import {
  ValidationError,
  InsertError,
  UpdatingDataError,
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
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToRegisterUser(body))
      return next(
        new ValidationError(
          'Faltan campos obligatorios en el registro de usuario'
        )
      )

    const emailOnUse = await User.findOne({ email: body.email })

    if (emailOnUse)
      return next(new ValidationError('El email ya está registrado'))

    const newUser = await User.create(body)
    if (!newUser)
      return next(
        new InsertError('No se pudo insertar el usuario en el servidor')
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
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToLogin(body))
      return next(
        new ValidationError('Faltan campos obligatorios en el login de usuario')
      )

    const userFound = await User.findOne({ email: body.email })
      .select('+password')
      .populate('cardPayments')
      .populate('premiumAccount')
    let matchPass

    if (userFound) {
      const bodyPass = body.password
      const encodePass = userFound.password
      matchPass = await bcrypt.compare(bodyPass, encodePass)
    }

    if (!userFound || !matchPass)
      return next(
        new ValidationError('Email de usuario o contraseña incorrectos')
      )
    const userObject = userFound.toObject()
    delete userObject.password

    const sessionToken = generateToken(userFound._id)
    return res.status(200).json({
      message: 'Login realizado con éxito',
      sessionToken,
      user: userObject,
    })
  } catch (error) {
    next(new AppError('Error inesperado en el login de usuario -> ' + error))
  }
}

// Change current password encoding the new one
const modifyPassword = async (req, res, next) => {
  try {
    const body = req.body

    if (!isBody(body))
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToChangePass(body))
      return next(
        new ValidationError(
          'Faltan campos obligatorios para el cambio de contraseña'
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
      return next(new ValidationError('La contraseña actual no coincide'))

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

// Get all user (Paginado)
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50)
    const skip = (page - 1) * limit

    const [users, totalUsers] = await Promise.all([
      User.find()
        .select('-password')
        .populate('premiumAccount')
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ])

    if (users.length === 0)
      return next(new NotFoundError('No se encontraron usuarios'))

    const totalPages = Math.ceil(totalUsers / limit)

    res.status(200).json({
      message: 'Mostrando lista de usuarios',
      data: users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error) {
    next(new AppError('Error obteniendo los usuarios -> ' + error))
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
const addUserCard = async (userId, cardId) => {
  if (!cardId)
    throw new ValidationError(
      'Es necesario adjuntar los datos de la tarjeta guardados'
    )

  const user = await User.findById(userId)
  if (!user)
    throw new NotFoundError('El usuario no se encuentra en el servidor')

  const cardslist = user.cardPayments
  const hadUserCard = cardslist.includes(cardId.toString())
  if (hadUserCard)
    throw new ValidationError('La tarjeta ya está registrada en su lista')

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
    throw new InsertError('Error guardando la tarjeta en la lista del usuario')
}

// Delete card from list
const deleteUserCard = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const cardId = req.params.id

    await userHasCard(userId, cardId)

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      { $pull: { cardPayments: cardId } },
      { returnDocument: 'after', runValidators: true }
    )

    res.status(200).json({
      message: 'Tarjeta eliminada de la lista con éxito',
      data: userUpdated,
    })
  } catch (error) {
    next(new AppError('Error eliminando tarjeta del usuario -> ' + error))
  }
}

// Delete card on users that take it associated when admin delete that card from server due to some reason
const globalDeleteCard = async (cardId) => {
  const updateResult = await User.updateMany(
    { cardPayments: cardId },
    { $pull: { cardPayments: cardId } }
  )
  return updateResult.modifiedCount
}

// Check if user has card sent
const userHasCard = async (userId, cardId, session) => {
  const user = await User.findById(userId).session(session)
  if (!user) {
    throw new NotFoundError('El usuario no se encuentra en el servidor')
  }

  const cardExists = user.cardPayments.some(
    (id) => id.toString() === cardId.toString()
  )
  if (!cardExists) {
    throw new NotFoundError(
      'La tarjeta no se encuentra en la lista del usuario'
    )
  }
}

// Get userPremium account ID
const getUserPremiumAccountId = async (userId, session) => {
  if (!userId) throw new ValidationError('Id de usuario requerido')

  const user = await User.findById(userId).session(session)
  if (!user) {
    throw new NotFoundError('El usuario no se encuentra en el servidor')
  }

  return user.premiumAccount
}

// Set a first time premium account id
const setUserPremiumAccount = async (userId, premiumAccountId, session) => {
  if (!userId || !premiumAccountId)
    throw new ValidationError('Se requiren ids de usuario y de cuenta premium')
  const userUpdated = await User.findByIdAndUpdate(
    userId,
    { premiumAccount: premiumAccountId },
    { returnDocument: 'after', runValidators: true, session }
  )
  if (!userUpdated)
    throw new UpdatingDataError('Error asociando cuenta premium de usuario')
}

export {
  createUser,
  login,
  modifyPassword,
  getUsers,
  modifyProfileImg,
  addUserCard,
  deleteUserCard,
  globalDeleteCard,
  userHasCard,
  getUserPremiumAccountId,
  setUserPremiumAccount,
}
