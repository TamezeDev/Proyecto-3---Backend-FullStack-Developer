import cron from 'node-cron'
import { PremiumAccount } from '../../src/models/premiumAccount.model'

// Daily task to find expired premium accounts and set them disabled
export const startPremiumExpirationTask = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date()
      const result = await PremiumAccount.updateMany(
        { isPremiumNow: true, nextPaymentDate: { $lt: now } },
        { $set: { isPremiumNow: false } }
      )
      console.log(
        `✅ Cuentas premium caducadas actualizadas: ${result.modifiedCount}`
      )
    } catch (error) {
      console.error('❌ Error actualizando cuentas premium caducadas ->', error)
    }
  })
}
