import mongoose from 'mongoose'

const Schema = mongoose.Schema

const premiumAccountSchema = new Schema(
  {
    isPremiumNow: { type: Boolean, required: true },
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
