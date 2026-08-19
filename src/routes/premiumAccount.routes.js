import { Router } from 'express'
import { setPremiumAccount } from '../repositories/premiumAccount.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.post('/setPremium', isAuth(), setPremiumAccount)

export default router
