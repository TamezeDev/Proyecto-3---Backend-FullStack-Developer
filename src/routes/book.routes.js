import { Router } from 'express'
import { addBook } from '../repositories/book.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.post('/create', isAuth('admin'), addBook)

export default router
