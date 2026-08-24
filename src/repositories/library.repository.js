import { User } from '../models/user.model.js'
import {
  ValidationError,
  UpdatingDataError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import { isBookIdOnDb } from './book.repository.js'

// Add book to user's library (requires premium)
const addBookToLibrary = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const bookId = req.params.id

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    const bookFound = await isBookIdOnDb(bookId)
    if (!bookFound)
      return next(
        new NotFoundError('El libro no se encuentra disponible en el catálogo')
      )

    const user = await User.findById(userId)
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const alreadyInLibrary = user.library.some(
      (item) => item.book.toString() === bookId.toString()
    )
    if (alreadyInLibrary)
      return next(
        new ValidationError('El libro ya se encuentra en tu biblioteca')
      )

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      { $push: { library: { book: bookId, dateAdded: new Date() } } },
      { returnDocument: 'after', runValidators: true }
    )
    if (!userUpdated)
      return next(
        new UpdatingDataError('Error añadiendo el libro a la biblioteca')
      )

    res.status(200).json({
      message: 'Libro añadido a tu biblioteca con éxito',
      data: userUpdated.library,
    })
  } catch (error) {
    next(new AppError('Error añadiendo libro a la biblioteca -> ' + error))
  }
}

// Remove book from user's library (also removes it from reading, if present)
const removeBookFromLibrary = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const bookId = req.params.id

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    const user = await User.findById(userId)
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const library = user.library
    const foundInLibrary = library.some(
      (item) => item.book.toString() === bookId.toString()
    )
    if (!foundInLibrary)
      return next(
        new ValidationError('El libro enviado no se encuentra en tu librería')
      )

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          library: { book: bookId },
          reading: { book: bookId },
        },
      },
      { returnDocument: 'after', runValidators: true }
    )
    if (!userUpdated)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    res.status(200).json({
      message: 'Libro eliminado de tu biblioteca con éxito',
      data: userUpdated.library,
    })
  } catch (error) {
    next(new AppError('Error eliminando libro de la biblioteca -> ' + error))
  }
}

// Get user's full library
const getUserLibrary = async (req, res, next) => {
  try {
    const userId = req.body.userId

    const user = await User.findById(userId).populate({
      path: 'library',
      populate: [{ path: 'book', model: 'Book' }],
    })
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    res.status(200).json({
      message: 'Mostrando biblioteca del usuario',
      data: user.library,
    })
  } catch (error) {
    next(new AppError('Error obteniendo la biblioteca del usuario -> ' + error))
  }
}

export { addBookToLibrary, removeBookFromLibrary, getUserLibrary }
