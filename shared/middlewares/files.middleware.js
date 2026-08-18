import multer from 'multer'
import { cloudinary } from '../../config/cloudinary.config.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'users_profile',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
})

const upload = multer({ storage })

export { upload }
