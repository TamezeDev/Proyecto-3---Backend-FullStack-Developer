import { expirePremiumAccounts } from '../repositories/cron.repository.js'
import { isCronAuth } from '../../shared/middlewares/cronAuth.middleware.js'
import { Router } from 'express'

const router = Router()

router.get('/expire', isCronAuth, expirePremiumAccounts)

export default router
