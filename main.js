import { initBackend, app } from './app.js'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })
const PORT = process.env.BACKEND_PORT

// Listener
const initListener = () =>
  app.listen(PORT, () => {
    console.log(`✅ Servidor iniciado en: http://localhost:${PORT}`)
  })

initBackend()
initListener()
