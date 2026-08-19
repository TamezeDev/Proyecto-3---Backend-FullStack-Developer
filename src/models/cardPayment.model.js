import mongoose from 'mongoose'

const Schema = mongoose.Schema

const cardPaymentSchema = new Schema(
  {
    nameOwner: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, 'El nombre del titular es obligatorio'],
      minlength: [3, 'El nombre del titular es demasiado corto'],
      match: [
        /^[A-ZÁÉÍÓÚÑÇÜ-]+(?: [A-ZÁÉÍÓÚÑÇÜ-]+)+$/,
        'El titular debe incluir nombre y al menos un apellido (solo letras y espacios)',
      ],
    },
    numberCard: {
      type: String,
      required: [true, 'El número de tarjeta es obligatorio'],
      trim: true,
      match: [/^\d{16}$/, 'El número de tarjeta debe contener 16 números'],
    },
    expiredDate: {
      type: String,
      required: [true, 'La fecha de caducidad es obligatoria'],
      trim: true,
      match: [/^(0[1-9]|1[0-2])\/\d{2}$/, 'El formato de fecha debe ser MM/AA'],
      validate: {
        validator: function (value) {
          const [inputMonth, inputYear] = value.split('/').map(Number)

          const now = new Date()
          const currentYear = now.getFullYear() % 100
          const currentMonth = now.getMonth() + 1

          if (inputYear < currentYear) return false

          if (inputYear === currentYear && inputMonth < currentMonth)
            return false

          return true
        },
        message: 'La tarjeta está caducada o la fecha no es válida',
      },
    },
    cvv: {
      type: String,
      required: [true, 'El código CVV es obligatorio'],
      trim: true,
      match: [/^\d{3,4}$/, 'El CVV debe tener 3 o 4 dígitos numéricos'],
    },
    credit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
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
