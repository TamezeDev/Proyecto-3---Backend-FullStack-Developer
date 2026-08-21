import mongoose from 'mongoose'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { Book } from '../src/models/book.model.js'
import { CardPayment } from '../src/models/cardPayment.model.js'
import { Genre } from '../src/models/genre.model.js'
import { PremiumPrice } from '../src/models/premiumPrice.model.js'
import { PremiumAccount } from '../src/models/premiumAccount.model.js'
import { User } from '../src/models/user.model.js'
import { connect, disconnect } from '../config/database.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const booksCsvPath = path.join(__dirname, './data/books.csv')
const cardPaymentCsvPath = path.join(__dirname, './data/cardPayments.csv')
const genresCsvPath = path.join(__dirname, './data/genres.csv')
const premiumPricesCsvPath = path.join(__dirname, './data/premiumPrices.csv')
const usersCsvPath = path.join(__dirname, './data/users.csv')

/* ==================
    SOWING METHODS
=====================*/
const insertGenres = async (session) => {
  const genresJson = await doJsonFromCsv(genresCsvPath)
  const genres = await Genre.insertMany(genresJson, { session })
  return new Map(genres.map((genre) => [genre.name, genre._id]))
}

const insertBooks = async (session, genres) => {
  const booksJson = await doJsonFromCsv(booksCsvPath)

  booksJson.forEach((book) => {
    book.genre = genres.get(book.genreName)
    delete book.genreName
    book.content = book.content.split('|')
    book.available = book.available.toLowerCase() === 'true'
    book.pages = Number(book.pages)
  })

  const books = await Book.insertMany(booksJson, { session })
  return new Map(books.map((book) => [book.isbn, book._id]))
}

const insertPremiumPrices = async (session) => {
  const pricePlansJson = await doJsonFromCsv(premiumPricesCsvPath)

  pricePlansJson.forEach((plan) => {
    plan.durationMonths = Number(plan.durationMonths)
    plan.price = Number(plan.price)
  })

  const premiumPrices = await PremiumPrice.insertMany(pricePlansJson, {
    session,
  })
  return new Map(premiumPrices.map((plan) => [plan.name, plan]))
}

const insertCardsPayment = async (session) => {
  const cardsJson = await doJsonFromCsv(cardPaymentCsvPath)

  cardsJson.forEach((card) => {
    card.credit = Number(card.credit)
  })

  const cardsPayments = await CardPayment.insertMany(
    cardsJson.map(({ owner_email, ...rest }) => rest),
    { session }
  )

  const emailList = cardsJson.map((item) => item.owner_email)
  return new Map(
    cardsPayments.map((cardPayment, i) => [emailList[i], cardPayment._id])
  )
}

const insertPremiumAccounts = async (session, usersJson, planMap) => {
  const accountsToCreate = usersJson
    .filter((row) => row.premiumPlan)
    .map((row) => {
      const plan = planMap.get(row.premiumPlan)

      const lastPaymentDate = new Date()
      lastPaymentDate.setDate(
        lastPaymentDate.getDate() - Math.floor(Math.random() * 15)
      )

      const nextPaymentDate = new Date(lastPaymentDate)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + plan.durationMonths)

      return {
        email: row.email,
        durationMonths: plan.durationMonths,
        lastPaymentDate,
        nextPaymentDate,
        paymentDates: [lastPaymentDate],
      }
    })

  if (accountsToCreate.length === 0) return new Map()

  const premiumAccounts = await PremiumAccount.insertMany(
    accountsToCreate.map(({ email, ...rest }) => rest),
    { session }
  )

  const emailList = accountsToCreate.map((item) => item.email)
  return new Map(emailList.map((email, i) => [email, premiumAccounts[i]._id]))
}

const insertUsers = async (session, booksMap, planMap, cardsMap) => {
  const usersJson = await doJsonFromCsv(usersCsvPath)

  const premiumAccountsMap = await insertPremiumAccounts(
    session,
    usersJson,
    planMap
  )

  addLibraryReadingToUser(usersJson, booksMap)
  addPremiumAccountsToUser(usersJson, premiumAccountsMap)
  addCardsPaymentToUser(usersJson, cardsMap)

  await User.create(usersJson, { session, ordered: true })
}

/* ==================
    AUX METHODS
=====================*/
const readFile = async (filePath) => {
  return fs.readFile(filePath, 'utf-8')
}

const doJsonFromCsv = async (file) => {
  const plainData = await readFile(file)
  const splitRows = plainData
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')

  const [headerLine, ...dataLines] = splitRows
  const splitHeader = headerLine.split(';')

  return dataLines.map((line) => {
    const splitLine = line.split(';')
    const data = {}
    for (let i = 0; i < splitHeader.length; i++) {
      data[splitHeader[i]] = splitLine[i] ?? ''
    }
    return data
  })
}

const addLibraryReadingToUser = (usersJson, booksMap) => {
  usersJson.forEach((user) => {
    const libraryIsbns = user.library_isbns ? user.library_isbns.split('|') : []
    const readingIsbns = user.reading_isbns ? user.reading_isbns.split('|') : []

    user.library = libraryIsbns
      .map((isbn) => booksMap.get(isbn))
      .filter(Boolean)
      .map((bookId) => ({ book: bookId, dateAdded: new Date() }))

    user.reading = readingIsbns
      .map((isbn) => booksMap.get(isbn))
      .filter(Boolean)
      .map((bookId) => ({ book: bookId, currentPage: 1, lastRead: new Date() }))

    delete user.library_isbns
    delete user.reading_isbns
  })
}

const addPremiumAccountsToUser = (usersJson, premiumAccountsMap) => {
  usersJson.forEach((user) => {
    const accountId = premiumAccountsMap.get(user.email)
    if (accountId) user.premiumAccount = accountId
    delete user.premiumPlan
  })
}

const addCardsPaymentToUser = (usersJson, cardsMap) => {
  usersJson.forEach((user) => {
    const cardId = cardsMap.get(user.email)
    user.cardPayments = cardId ? [cardId] : []
  })
}

const wipeDataBase = async () => {
  await Promise.all([
    Book.deleteMany(),
    CardPayment.deleteMany(),
    Genre.deleteMany(),
    PremiumAccount.deleteMany(),
    PremiumPrice.deleteMany(),
    User.deleteMany(),
  ])
}

/* ==================
    MAIN FUNCTION
=====================*/
export const runScriptToSowDb = async () => {
  let session = null

  try {
    await connect()
    session = await mongoose.startSession()

    await wipeDataBase()

    await session.withTransaction(async () => {
      const genres = await insertGenres(session)
      const books = await insertBooks(session, genres)
      const plansPrices = await insertPremiumPrices(session)
      const paymentCards = await insertCardsPayment(session)
      await insertUsers(session, books, plansPrices, paymentCards)
    })

    console.log('✅ Script de carga de datos ejecutado con éxito ')
  } catch (error) {
    console.error(
      `❌ Hubo un error cargando el script para rellenar la base de datos-> ${error}`
    )
  } finally {
    if (session) await session.endSession()
    await disconnect()
  }
}

runScriptToSowDb()
