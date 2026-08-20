import { Router } from 'express'
import {
  addBook,
  setAvailableBook,
  setNoAvailableBook,
  getAvailableBooks,
  getDisableBooks,
} from '../repositories/book.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.get('/', getAvailableBooks)
router.get('/disabled', isAuth('admin'), getDisableBooks)

router.post('/create', isAuth('admin'), addBook)

router.put('/enable/:id', isAuth('admin'), setAvailableBook)
router.put('/disable/:id', isAuth('admin'), setNoAvailableBook)

export default router
