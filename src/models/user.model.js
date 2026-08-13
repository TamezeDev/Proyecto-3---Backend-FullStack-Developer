import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor, introduce un email válido',
      ],
    },
    password: {
      type: String,
      trim: true,
      required: true,
      match: [
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?_#&-]+$/,
        'La contraseña debe contener mayusculas, minusculas y algún caracter especial',
      ],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false,
    },
    birthDate: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      trim: true,
      default: 'user',
    },
    imageProfileUrl: { type: String, trim: true },
    imageProfileId: { type: String, trim: true },
    reading: [
      {
        book: { type: mongoose.Types.ObjectId, ref: 'Book', unique: true },
        currentPage: { type: Number, default: 1, required: true },
        lastRead: { type: Date, default: Date.now, required: true },
      },
    ],
    library: [
      {
        book: { type: mongoose.Types.ObjectId, ref: 'Book', unique: true },
        dateAdded: { type: Date, default: Date.now, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

userSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, 10)
  next
})

const User = mongoose.model('User', userSchema, 'users')

export { User }
