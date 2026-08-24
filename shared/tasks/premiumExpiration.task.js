import { PremiumAccount } from '../../src/models/premiumAccount.model.js'

// Daily task to find expired premium accounts and set them disabled
export const startPremiumExpirationTask = async () => {
  try {
    const now = new Date()
    const result = await PremiumAccount.updateMany(
      { isPremiumNow: true, nextPaymentDate: { $lt: now } },
      { $set: { isPremiumNow: false } }
    )
    console.log(
      `✅ Cuentas premium caducadas actualizadas: ${result.modifiedCount}`
    )
    return result.modifiedCount
  } catch (error) {
    console.error('❌ Error actualizando cuentas premium caducadas ->', error)
  }
}
