import { User } from '../models/user.model.js'
import {
  ValidationError,
  UpdatingDataError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import {
  isBody,
  bodyValidToUpdateReadingPage,
} from '../../utils/bodyRequirements.js'
import { getBookById } from './book.repository.js'

// Start reading a book (requires premium, and the book already in library)
const addBookToReading = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const bookId = req.params.id

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    const user = await User.findById(userId)
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const inLibrary = user.library.some(
      (item) => item.book.toString() === bookId.toString()
    )
    if (!inLibrary)
      return next(
        new ValidationError(
          'Debes añadir el libro a tu biblioteca antes de leerlo'
        )
      )

    const alreadyReading = user.reading.some(
      (item) => item.book.toString() === bookId.toString()
    )
    if (alreadyReading)
      return next(
        new ValidationError(
          'Ya tienes este libro en tu lista de lectura actual'
        )
      )

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          reading: { book: bookId, lastRead: new Date() },
        },
      },
      { returnDocument: 'after', runValidators: true }
    )
    if (!userUpdated)
      return next(
        new UpdatingDataError('Error añadiendo el libro a tu lectura actual')
      )

    res.status(200).json({
      message: 'Libro añadido a tu lectura actual con éxito',
      data: userUpdated.reading,
    })
  } catch (error) {
    next(new AppError('Error añadiendo libro a lectura actual -> ' + error))
  }
}

// Stop reading a book (finished or abandoned)
const removeBookFromReading = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const bookId = req.params.id

    if (!bookId)
      return next(new ValidationError('Error: Id de libro requerido'))

    const user = await User.findById(userId)
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const reading = user.reading
    const foundReading = reading.some(
      (item) => item.book.toString() === bookId.toString()
    )
    if (!foundReading)
      return next(
        new ValidationError(
          'El libro enviado no se encuentra en la lista de leyendo'
        )
      )

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      { $pull: { reading: { book: bookId } } },
      { returnDocument: 'after', runValidators: true }
    )
    if (!userUpdated)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    res.status(200).json({
      message: 'Libro eliminado de tu lectura actual con éxito',
      data: userUpdated,
    })
  } catch (error) {
    next(new AppError('Error eliminando libro de lectura actual -> ' + error))
  }
}

// Get user's currently reading books (premium only)
const getUserReading = async (req, res, next) => {
  try {
    const userId = req.body.userId

    const user = await User.findById(userId).populate({
      path: 'reading',
      populate: [{ path: 'book', model: 'Book' }],
    })
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    res.status(200).json({
      message: 'Mostrando libros en lectura actual',
      data: user.reading,
    })
  } catch (error) {
    next(new AppError('Error obteniendo la lista de lectura -> ' + error))
  }
}

// Get current page of a specific book being read (premium only)
const getReadingProgress = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const bookId = req.params.id

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    const user = await User.findById(userId).populate({
      path: 'reading',
      populate: [{ path: 'book' }],
    })
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const readingEntry = user.reading.find(
      (item) => item.book._id.toString() === bookId.toString()
    )
    if (!readingEntry)
      return next(
        new NotFoundError(
          'El libro enviado no se encuentra en tu lista de lectura'
        )
      )

    res.status(200).json({
      message: 'Mostrando progreso de lectura',
      data: {
        book: readingEntry.book,
        currentPage: readingEntry.currentPage,
        lastRead: readingEntry.lastRead,
      },
    })
  } catch (error) {
    next(new AppError('Error obteniendo el progreso de lectura -> ' + error))
  }
}

// Update current page of a specific book being read (premium only)
const setReadingPage = async (req, res, next) => {
  try {
    const userId = req.body.userId
    const bookId = req.params.id
    const body = req.body

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    if (!isBody(body))
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToUpdateReadingPage(body))
      return next(
        new ValidationError(
          'Error: Faltan campos obligatorios en el cuerpo de la petición'
        )
      )

    const book = await getBookById(bookId)

    if (body.currentPage > book.pages)
      return next(
        new ValidationError(`El libro solo tiene ${book.pages} páginas`)
      )

    const user = await User.findById(userId)
    if (!user)
      return next(
        new NotFoundError('El usuario no se encuentra en el servidor')
      )

    const readingEntry = user.reading.find(
      (item) => item.book.toString() === bookId.toString()
    )
    if (!readingEntry)
      return next(
        new NotFoundError(
          'El libro enviado no se encuentra en tu lista de lectura'
        )
      )

    readingEntry.currentPage = body.currentPage
    readingEntry.lastRead = new Date()

    await user.save()

    res.status(200).json({
      message: 'Página de lectura actualizada con éxito',
      data: user,
    })
  } catch (error) {
    next(new AppError('Error actualizando la página de lectura -> ' + error))
  }
}

export {
  addBookToReading,
  removeBookFromReading,
  getUserReading,
  getReadingProgress,
  setReadingPage,
}
