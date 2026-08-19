import mongoose from 'mongoose'

const Schema = mongoose.Schema

const premiumPriceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    durationMonths: {
      type: Number,
      required: true,
      min: [1, 'La duración mínima es de 1 mes'],
      max: [12, 'La duración máxima es de 12 meses'],
    },
    price: {
      type: Number,
      required: true,
      min: [1, 'El importe mínimo es de 1€'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const PremiumPrice = mongoose.model(
  'PremiumPrice',
  premiumPriceSchema,
  'premiumPrices'
)

export { PremiumPrice }
