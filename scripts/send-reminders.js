import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { runReminderCheck } from './reminderCheck.js'

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

if (!rawServiceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.')
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(rawServiceAccount)) })
}

await runReminderCheck({ database: getFirestore(), messaging: getMessaging() })
