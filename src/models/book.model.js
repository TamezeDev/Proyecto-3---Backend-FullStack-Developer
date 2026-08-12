import mongoose from 'mongoose'

const Schema = mongoose.Schema

const bookSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    isbn: { type: String, trim: true, required: true, unique: true },
    author: { type: String, trim: true },
    pages: { type: Number },
    synopsis: { type: String, trim: true, required: true },
    content: [{ type: String, required: true, trim: true }],
    genre: { type: mongoose.Types.ObjectId, ref: 'Genre' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Book = mongoose.model('Book', bookSchema, 'books')

export { Book }
