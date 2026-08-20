import { Genre } from '../models/genre.model.js'
import {
  ValidationError,
  InsertError,
  UpdatingDataError,
  AppError,
  NotFoundError,
} from '../../shared/errors/app.error.js'
import { isBody } from '../../utils/bodyRequirements.js'

// Is Genre in Db?
export const isGenre = async (genreName, session) => {
  if (!genreName) throw new ValidationError('Debe enviar el nombre del genero')
  const genreFound = await Genre.findOne({ name: genreName }).session(session)
  if (!genreFound) return { found: false }
  return { found: true, data: genreFound }
}

// Add new genre
export const addGenre = async (genreName, session) => {
  if (!genreName) throw new ValidationError('Debe enviar el nombre del genero')
  const [genre] = await Genre.create([{ name: genreName }], { session })
  if (!genre) throw new InsertError('Error añadiendo el género al servidor')
  return genre
}
