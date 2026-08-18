import { Router } from 'express'
import { createUser, login } from '../repositories/user.repository.js'
const router = Router()

router.post('/create', createUser)
router.post('/login', login)

export default router
