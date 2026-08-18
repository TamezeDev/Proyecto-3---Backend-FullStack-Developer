import { Router } from 'express'
import {
  createUser,
  login,
  modifyPassword,
  getUsers,
} from '../repositories/user.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

router.get('/', isAuth('admin'), getUsers)

router.post('/create', createUser)
router.post('/login', login)

router.put('/modifyPass', isAuth(), modifyPassword)

export default router
