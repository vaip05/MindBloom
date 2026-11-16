import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

if (!rawServiceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.')
}

const serviceAccount = JSON.parse(rawServiceAccount)

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) })
}

const database = getFirestore()
const messaging = getMessaging()
const SITE_URL = 'https://mindbloom-66aa0.web.app'
const WINDOW_MINUTES = 10

function localParts(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  }
}

function isDue(reminder, now) {
  if (!reminder.enabled || !reminder.date || !reminder.time) return false

  const current = localParts(now, reminder.timezone)
  if (current.date !== reminder.date) return false

  const [hours, minutes] = reminder.time.split(':').map(Number)
  const targetMinutes = hours * 60 + minutes
  const elapsed = current.minutes - targetMinutes

  return elapsed >= 0 && elapsed <= WINDOW_MINUTES
}

function occurrenceKey(reminder) {
  return `${reminder.date}T${reminder.time}`
}

async function sendReminder(reminderSnapshot) {
  const reminder = reminderSnapshot.data()
  const uid = reminderSnapshot.ref.parent.parent.id
  const key = occurrenceKey(reminder)

  if (!isDue(reminder, new Date()) || reminder.lastSentFor === key) return false

  const tokenSnapshot = await database
    .collection('users')
    .doc(uid)
    .collection('notificationTokens')
    .get()

  const tokens = tokenSnapshot.docs
    .map((tokenDoc) => ({ id: tokenDoc.id, token: tokenDoc.data().token }))
    .filter((item) => item.token)

  if (tokens.length === 0) {
    console.log(`No browser token found for reminder ${reminderSnapshot.id}`)
    return false
  }

  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((item) => item.token),
    data: {
      title: 'MindBloom wellness reminder',
      body: 'Take a moment for yourself.',
      tag: `mindbloom-reminder-${reminderSnapshot.id}`,
      reminderId: reminderSnapshot.id,
      link: `${SITE_URL}/reminders`,
    },
    webpush: {
      headers: { Urgency: 'high' },
      fcmOptions: { link: `${SITE_URL}/reminders` },
    },
  })

  const invalidTokenDeletes = []
  response.responses.forEach((result, index) => {
    const code = result.error?.code
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token'
    ) {
      invalidTokenDeletes.push(
        database
          .collection('users')
          .doc(uid)
          .collection('notificationTokens')
          .doc(tokens[index].id)
          .delete(),
      )
    }
  })
  await Promise.all(invalidTokenDeletes)

  if (response.successCount > 0) {
    await reminderSnapshot.ref.set(
      {
        lastSentFor: key,
        lastSentAt: Timestamp.now(),
      },
      { merge: true },
    )
    console.log(`Sent reminder ${reminderSnapshot.id} to ${response.successCount} browser(s)`)
    return true
  }

  console.log(`Reminder ${reminderSnapshot.id} could not be delivered`)
  return false
}

const snapshot = await database
  .collectionGroup('reminders')
  .where('enabled', '==', true)
  .get()

let sent = 0
for (const reminderSnapshot of snapshot.docs) {
  if (await sendReminder(reminderSnapshot)) sent += 1
}

console.log(`Finished reminder check. Sent ${sent} reminder(s).`)
