import { deliveryStep, MISSED_NOTES, occurrenceKey } from '../src/lib/reminderDelivery.js'

const SITE_URL = 'https://mindbloom-66aa0.web.app'
const DEAD_TOKEN_CODES = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]

async function markMissed(reminderSnapshot, note, now) {
  await reminderSnapshot.ref.set(
    { deliveryStatus: 'missed', deliveryNote: note, updatedAt: now },
    { merge: true },
  )
  console.log(`Reminder ${reminderSnapshot.id} missed: ${note}`)
  return 'missed'
}

/** Sends one reminder if it is due. Returns 'sent', 'missed' or 'skipped'. */
export async function checkReminder({ database, messaging, reminderSnapshot, now }) {
  const reminder = reminderSnapshot.data()
  const step = deliveryStep(reminder, now)

  if (step === 'late') return markMissed(reminderSnapshot, MISSED_NOTES.late, now)
  if (step !== 'send') return 'skipped'

  const uid = reminderSnapshot.ref.parent.parent.id
  const tokenCollection = database.collection('users').doc(uid).collection('notificationTokens')
  const tokenSnapshot = await tokenCollection.get()
  const tokens = tokenSnapshot.docs
    .map((tokenDoc) => ({ id: tokenDoc.id, token: tokenDoc.data().token }))
    .filter((item) => item.token)

  if (tokens.length === 0) return markMissed(reminderSnapshot, MISSED_NOTES.noBrowser, now)

  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((item) => item.token),
    data: {
      title: 'MindBloom wellness reminder',
      body: reminder.message || 'Take a moment for yourself.',
      tag: `mindbloom-reminder-${reminderSnapshot.id}`,
      reminderId: reminderSnapshot.id,
      link: `${SITE_URL}/reminders`,
    },
    webpush: {
      headers: { Urgency: 'high' },
      fcmOptions: { link: `${SITE_URL}/reminders` },
    },
  })

  await Promise.all(
    response.responses
      .map((result, index) => (DEAD_TOKEN_CODES.includes(result.error?.code) ? tokens[index].id : null))
      .filter(Boolean)
      .map((tokenId) => tokenCollection.doc(tokenId).delete()),
  )

  if (response.successCount === 0) return markMissed(reminderSnapshot, MISSED_NOTES.unreachable, now)

  await reminderSnapshot.ref.set(
    { deliveryStatus: 'sent', lastSentFor: occurrenceKey(reminder), lastSentAt: now },
    { merge: true },
  )
  console.log(`Sent reminder ${reminderSnapshot.id} to ${response.successCount} browser(s)`)
  return 'sent'
}

/** Checks every turned-on reminder once. */
export async function runReminderCheck({ database, messaging, now = new Date() }) {
  const snapshot = await database.collectionGroup('reminders').where('enabled', '==', true).get()
  const totals = { sent: 0, missed: 0, skipped: 0 }
  for (const reminderSnapshot of snapshot.docs) {
    const outcome = await checkReminder({ database, messaging, reminderSnapshot, now })
    totals[outcome] += 1
  }
  console.log(`Finished reminder check. Sent ${totals.sent}, missed ${totals.missed}.`)
  return totals
}
