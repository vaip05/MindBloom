import { getReminders } from '../services/firestoreServices'
import { scheduleReminderNotification } from './notifications'

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
    cleanups = reminders
      .filter((reminder) => reminder.enabled && reminder.time)
      .map((reminder) => scheduleReminderNotification(reminder))
    return reminders
  })
  pending = run.then(
    () => {},
    () => {},
  )
  return run
}
