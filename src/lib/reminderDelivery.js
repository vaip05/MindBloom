// Shared by the browser and scripts/send-reminders.js, so keep it free of imports.

// How long after the chosen time a reminder can still go out.
export const SEND_WINDOW_MINUTES = 10

export const MISSED_NOTES = {
  late: 'The reminder check ran too late to send it on time.',
  noBrowser: 'No browser was registered for notifications.',
  unreachable: 'Your browser could not be reached.',
}

export function occurrenceKey(reminder) {
  return `${reminder.date}T${reminder.time}`
}

// Date and minutes since midnight as seen in the reminder's time zone.
export function localParts(date, timezone) {
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
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  )

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  }
}

export function isDelivered(reminder) {
  return Boolean(reminder.deliveryStatus) || reminder.lastSentFor === occurrenceKey(reminder)
}

/**
 * What should happen to a reminder right now:
 * 'off' (turned off or incomplete), 'done' (already sent or marked missed),
 * 'waiting' (not time yet), 'send' (inside the send window), 'late' (window passed).
 */
export function deliveryStep(reminder, now = new Date()) {
  if (!reminder?.enabled || !reminder.date || !reminder.time) return 'off'
  if (isDelivered(reminder)) return 'done'

  const current = localParts(now, reminder.timezone)
  const [hours, minutes] = reminder.time.split(':').map(Number)
  // Counting whole days keeps a 23:55 reminder sendable at 00:03 the next day.
  const days = (dayNumber(current.date) - dayNumber(reminder.date)) * 24 * 60
  const elapsed = days + current.minutes - (hours * 60 + minutes)
  if (elapsed < 0) return 'waiting'
  return elapsed <= SEND_WINDOW_MINUTES ? 'send' : 'late'
}

function dayNumber(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / 86_400_000
}
