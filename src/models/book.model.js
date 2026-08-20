import mongoose from 'mongoose'

const Schema = mongoose.Schema

const bookSchema = new Schema(
  {
    bookName: { type: String, trim: true, required: true },
    isbn: { type: String, trim: true, required: true, unique: true },
    author: { type: String, trim: true },
    pages: {
      type: Number,
      required: true,
      min: [1, 'El libro debe contener al menos 1 hoja'],
    },
    synopsis: { type: String, trim: true, required: true },
    content: [
      {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'El contenido no puede estar vacío'],
      },
    ],
    genre: { type: mongoose.Types.ObjectId, ref: 'Genre' },
    available: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Book = mongoose.model('Book', bookSchema, 'books')

export { Book }
