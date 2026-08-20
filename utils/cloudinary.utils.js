import cloudinary from 'cloudinary'
import { CloudinaryError } from '../shared/errors/app.error.js'

// Delete a image from cloudinary server receiving imgId
const deleteImgCloudinary = async (imgId) => {
  if (!imgId) return
  try {
    await cloudinary.uploader.destroy(imgId)
  } catch (error) {
    throw new CloudinaryError(
      'Cloudinary -> error eliminando imagen del almacenamiento ' + imgId,
      error.message
    )
  }
}

export { deleteImgCloudinary }
