import mongoose from 'mongoose'

const Schema = mongoose.Schema

const cardPaymentSchema = new Schema(
  {
    nameOwner: { type: String, trim: true, required: true },
    numberCard: {
      type: String,
      required: true,
      minlength: [16, 'Debe contener 16 dígitos'],
      maxlength: [16, 'Debe contener 16 dígitos'],
    },
    expiredDate: {
      type: String,
      required: true,
      match: [/^\d{2}\/\d{2}$/, 'El formato debe ser MM/AA'],
    },
    cvv: {
      type: String,
      required: true,
      match: [/^\d{3,4}$/, 'El CVV debe tener 3 o 4 dígitos'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const CardPayment = mongoose.model(
  'CardPayment',
  cardPaymentSchema,
  'cardPayments'
)

export { CardPayment }
