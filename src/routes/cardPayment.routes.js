import { Router } from 'express'
import { newCard } from '../repositories/cardPayment.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.post('/create', isAuth(), newCard)

export default router
