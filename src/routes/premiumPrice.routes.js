import { Router } from 'express'
import {
  createPremiumPlan,
  deletePremiumPlan,
  updatePremiumPlan,
  getPremiumPlans,
} from '../repositories/premiumPrice.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.get('/', getPremiumPlans)

router.post('/create', isAuth('admin'), createPremiumPlan)

router.put('/modify/:id', isAuth('admin'), updatePremiumPlan)

router.delete('/:id', isAuth('admin'), deletePremiumPlan)

export default router
