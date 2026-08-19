import mongoose from 'mongoose'

const Schema = mongoose.Schema

const genreSchema = new Schema(
  {
    name: { type: String, trim: true, required: true, unique: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Genre = mongoose.model('Genre', genreSchema, 'genres')

export { Genre }
