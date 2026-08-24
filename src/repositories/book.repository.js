import mongoose from 'mongoose'
import { Book } from '../models/book.model.js'
import {
  ValidationError,
  InsertError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import { isBody, bodyValidToCreateBook } from '../../utils/bodyRequirements.js'
import { isGenre, addGenre } from './genre.repository.js'

// Add new book
export const addBook = async (req, res, next) => {
  const session = await mongoose.startSession()

  try {
    const body = req.body
    if (!isBody(body))
      return next(new ValidationError('El cuerpo de la petición está vacío'))

    if (!bodyValidToCreateBook(body))
      return next(
        new ValidationError(
          'Faltan campos obligatorios en el cuerpo de la petición'
        )
      )

    if (!body.author) body.author = 'Anónimo'

    let genreId
    let book

    await session.withTransaction(async () => {
      const isBook = await isBookUploaded(body.isbn, session)
      if (isBook)
        throw new ValidationError(
          'El libro que ha enviado ya se encuentra en la base de datos'
        )

      const genre = await isGenre(body.genreName, session)
      if (genre.found) {
        genreId = genre.data._id
      } else {
        const genre = await addGenre(body.genreName, session)
        genreId = genre._id
      }

      body.genre = genreId

      const [createdBook] = await Book.create([body], { session })
      book = createdBook
      if (!book)
        throw new InsertError('No se pudo insertar el libro en el servidor')
    })
    res
      .status(201)
      .json({ message: 'Libro añadido al catálogo con éxito', data: book })
  } catch (error) {
    if (
      error.status ||
      error.name === 'ValidationError' ||
      error.name === 'NotFoundError' ||
      error.name === 'InsertError'
    ) {
      return next(error)
    }
    next(
      new AppError('Error inesperado añadiendo libro al catálogo -> ' + error)
    )
  } finally {
    await session.endSession()
  }
}

// Disable a book from catalog
export const setNoAvailableBook = async (req, res, next) => {
  try {
    const bookId = req.params.id

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    const deletedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        available: false,
      },
      { returnDocument: 'after', runValidators: true }
    )
    if (!deletedBook)
      return next(new NotFoundError('El libro no se encuentra en el servidor'))

    res.status(200).json({
      message: 'Libro desactivado del catálogo con éxito',
      data: deletedBook,
    })
  } catch (error) {
    next(new AppError('Error eliminando el libro del catálogo -> ' + error))
  }
}

// Enable a book from catalog
export const setAvailableBook = async (req, res, next) => {
  try {
    const bookId = req.params.id

    if (!bookId) return next(new ValidationError('Id de libro requerido'))

    const activeBook = await Book.findByIdAndUpdate(
      bookId,
      {
        available: true,
      },
      { returnDocument: 'after', runValidators: true }
    )
    if (!activeBook)
      return next(new NotFoundError('El libro no se encuentra en el servidor'))

    res.status(200).json({
      message: 'Libro activo en el catálogo con éxito',
      data: activeBook,
    })
  } catch (error) {
    next(new AppError('Error activando el libro del catálogo -> ' + error))
  }
}

// Get all available books for the catalog (paginated, without full content)
export const getAvailableBooks = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 15, 1), 50)
    const skip = (page - 1) * limit

    const [books, totalBooks] = await Promise.all([
      Book.find({ available: true })
        .select('-content')
        .populate('genre')
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments({ available: true }),
    ])

    if (books.length === 0)
      return next(new NotFoundError('El catálogo de libros está vacío'))

    res.status(200).json({
      message: 'Mostrando catálogo de libros',
      data: books,
      pagination: {
        page,
        limit,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        hasMore: page * limit < totalBooks,
      },
    })
  } catch (error) {
    next(new AppError('Error obteniendo el catálogo de libros -> ' + error))
  }
}

// Get all disabled books for the catalog
export const getDisableBooks = async (_req, res, next) => {
  try {
    const books = await Book.find({ available: false }).populate('genre')

    if (books.length === 0)
      return next(
        new NotFoundError('El catálogo de libros desactivados está vacío')
      )

    res.status(200).json({
      message: 'Mostrando catálogo de libros desactivados',
      data: books,
    })
  } catch (error) {
    next(
      new AppError(
        'Error obteniendo el catálogo de libros desactivados -> ' + error
      )
    )
  }
}

// Get info

// Is book available in db
export const isBookIdOnDb = async (bookID) => {
  if (!bookID) throw new ValidationError('Debe enviar el id del libro')
  const book = await Book.findById(bookID)
  if (!book) throw new NotFoundError('El libro no se encuentra en el servidor')
  return Boolean(book && book.available)
}

// Get book by id for backend
export const getBookById = async (bookId) => {
  if (!bookId) throw new ValidationError('Debe enviar el id del libro')
  const book = await Book.findById(bookId)
  if (!book) throw new NotFoundError('El libro no se encuentra en el servidor')
  return book
}

/* ===================
    PRIVATE METHODS
======================*/
const isBookUploaded = async (isbn, session) => {
  if (!isbn) throw new ValidationError('Debe enviar el isbn del libro')
  const book = await Book.findOne({ isbn: isbn }).session(session)
  return Boolean(book)
}
