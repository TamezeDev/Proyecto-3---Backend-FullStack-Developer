import mongoose from 'mongoose'

const Schema = mongoose.Schema

const premiumAccountSchema = new Schema(
  {
    isPremiumNow: { type: Boolean, required: true, default: true },
    durationMonths: {
      type: Number,
      required: true,
      min: [1, 'La duración mínima es de 1 mes'],
      max: [12, 'La duración máxima es de 12 meses'],
    },
    lastPaymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextPaymentDate: { type: Date, required: true },
    paymentDates: [{ type: Date, required: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const PremiumAccount = mongoose.model(
  'PremiumAccount',
  premiumAccountSchema,
  'premiumAccounts'
)

export { PremiumAccount }
