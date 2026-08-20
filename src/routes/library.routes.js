import { Router } from 'express'
import {
  addBookToLibrary,
  removeBookFromLibrary,
  getUserLibrary,
} from '../repositories/library.repository.js'
import { isPremium } from '../../shared/middlewares/premium.middleware.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.get('/library', isAuth(), getUserLibrary)

router.post('/library/:id', isAuth(), isPremium, addBookToLibrary)

router.delete('/library/:id', isAuth(), removeBookFromLibrary)

export default router
