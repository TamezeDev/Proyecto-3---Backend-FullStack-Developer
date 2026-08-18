import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { setServers } from 'node:dns/promises'

setServers(['1.1.1.1', '8.8.8.8'])

dotenv.config({ quiet: true })
const MONGO_DB_URL = process.env.MONGO_DB_URL

const connect = async () => {
  try {
    await mongoose.connect(MONGO_DB_URL)
    console.warn('✅ Conectado con base de datos con éxito')
  } catch (error) {
    console.error('❌ Hubo un problema al conectar con la base de datos')
  }
}

const disconnect = async () => {
  try {
    await mongoose.disconnect()
    console.warn('✅ Desconectado de la base de datos con éxito')
  } catch (error) {
    console.error('❌ Hubo un problema al desconectar de la base de datos')
  }
}

export { connect, disconnect }
