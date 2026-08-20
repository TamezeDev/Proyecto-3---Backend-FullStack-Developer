import { Router } from 'express'
import {
  addBookToReading,
  removeBookFromReading,
  getUserReading,
  getReadingProgress,
  setReadingPage,
} from '../repositories/reading.repository.js'
import { isPremium } from '../../shared/middlewares/premium.middleware.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.get('/reading', isAuth(), isPremium, getUserReading)
router.get('/reading/:id', isAuth(), isPremium, getReadingProgress)

router.post('/reading/:id', isAuth(), isPremium, addBookToReading)

router.put('/reading/:id', isAuth(), isPremium, setReadingPage)

router.delete('/reading/:id', isAuth(), isPremium, removeBookFromReading)

export default router
