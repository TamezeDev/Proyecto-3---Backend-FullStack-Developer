import mongoose from 'mongoose'
import { Book } from '../models/book.model.js'
import {
  ValidationError,
  InsertError,
  UpdatingDataError,
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
      return next(
        new ValidationError('Error: El cuerpo de la petición está vacío')
      )

    if (!bodyValidToCreateBook(body))
      return next(
        new ValidationError(
          'Error: Faltan campos obligatorios en el cuerpo de la petición'
        )
      )

    if (!body.author) body.author = 'Anónimo'

    let genreId
    let book

    await session.withTransaction(async () => {
      const isBook = await isBookUploaded(body.isbn, session)
      if (isBook)
        throw new ValidationError(
          'Error: El libro que ha enviado ya se encuentra en la base de datos'
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
        throw new InsertError(
          'Error: No se pudo insertar el libro en el servidor'
        )
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

/* ===================
    PRIVATE METHODS
======================*/
const isBookUploaded = async (isbn, session) => {
  if (!isbn) throw new ValidationError('Debe enviar el isbn del libro')
  const book = await Book.findOne({ isbn: isbn }).session(session)
  return Boolean(book)
}
