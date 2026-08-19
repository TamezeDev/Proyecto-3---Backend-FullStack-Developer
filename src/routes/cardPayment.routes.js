import { Router } from 'express'
import {
  newCard,
  deleteCardPayment,
  addCreditToCard,
} from '../repositories/cardPayment.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.post('/create', isAuth(), newCard)
router.post('/addCredit/:id', isAuth(), addCreditToCard)

router.delete('/:id', isAuth('admin'), deleteCardPayment)

export default router
