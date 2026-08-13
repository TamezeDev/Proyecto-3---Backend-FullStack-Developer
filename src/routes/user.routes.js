import { Router } from 'express'
import { createUser } from '../repositories/user.repository.js'
const router = Router()

router.post('/create', createUser)

export default router
