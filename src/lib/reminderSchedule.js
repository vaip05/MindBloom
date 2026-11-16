import { getReminders, markReminderSent } from '../services/firestoreServices'
import { scheduleReminderNotification } from './notifications'
import { isDelivered } from './reminderDelivery'

let cleanups = []
let pending = Promise.resolve()

export function clearReminderSchedule() {
  cleanups.forEach((stop) => stop())
  cleanups = []
}

export function syncReminderSchedule(uid) {
  const run = pending.then(async () => {
    clearReminderSchedule()
    const reminders = await getReminders(uid)
    // An open tab delivers the reminder itself and records it so the server does not send it again.
    cleanups = reminders
      .filter((reminder) => reminder.enabled && reminder.time && !isDelivered(reminder))
      .map((reminder) =>
        scheduleReminderNotification(reminder, (fired) => {
          markReminderSent(uid, fired).catch(() => {})
        }),
      )
    return reminders
  })
  pending = run.then(
    () => {},
    () => {},
  )
  return run
}
