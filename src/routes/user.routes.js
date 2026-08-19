import { Router } from 'express'
import {
  createUser,
  login,
  modifyPassword,
  getUsers,
  modifyProfileImg,
  deleteUserCard,
} from '../repositories/user.repository.js'
import { isAuth } from '../../shared/middlewares/auth.middleware.js'
import { upload } from '../../shared/middlewares/files.middleware.js'

const router = Router()

router.get('/', isAuth('admin'), getUsers)

router.post('/create', createUser)
router.post('/login', login)

router.put('/modifyPass', isAuth(), modifyPassword)
router.put('/imgProfile', upload.single('image'), isAuth(), modifyProfileImg)

router.delete('/card/:id', isAuth(), deleteUserCard)

export default router
