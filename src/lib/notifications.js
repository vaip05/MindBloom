export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) {
    return { granted: false, message: 'This browser does not support notifications.' }
  }

  if (Notification.permission === 'granted') {
    return { granted: true, message: 'Notifications are enabled.' }
  }

  if (Notification.permission === 'denied') {
    return {
      granted: false,
      message: 'Notifications are blocked. Enable them in your browser settings.',
    }
  }

  const permission = await Notification.requestPermission()
  return {
    granted: permission === 'granted',
    message:
      permission === 'granted'
        ? 'Notifications enabled. We will gently nudge you at your chosen time.'
        : 'Permission was not granted. You can enable it later in browser settings.',
  }
}

export function showWellnessNotification({ title, body, tag }) {
  const notice = {
    title: title || 'MindBloom reminder',
    body: body || 'Take a moment for yourself today.',
  }
  window.dispatchEvent(new CustomEvent('mindbloom-reminder', { detail: notice }))

  if (!notificationsSupported() || Notification.permission !== 'granted') {
    return false
  }

  try {
    new Notification(notice.title, {
      body: notice.body,
      icon: '/favicon.svg',
      tag: tag || 'mindbloom-reminder',
      requireInteraction: true,
    })
    return true
  } catch {
    return false
  }
}

export function todayDateInput(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function reminderDateTime(reminder) {
  if (!reminder?.time) return null
  const [hours, minutes] = reminder.time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(reminder.date || todayDateInput())
  if (!match) return null
  const target = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), hours, minutes, 0, 0)
  return Number.isNaN(target.getTime()) ? null : target
}

/** Schedule a browser notification for a saved local date and time. */
export function scheduleReminderNotification(reminder, onFire) {
  const target = reminderDateTime(reminder)
  if (!reminder?.enabled || !target) return () => {}

  const deliver = () => {
    showWellnessNotification({
      title: 'MindBloom wellness reminder',
      body: reminder.message || 'Take a moment for yourself.',
      tag: reminder.id ? `mindbloom-reminder-${reminder.id}` : 'mindbloom-reminder',
    })
    onFire?.(reminder)
  }

  let delay = target.getTime() - Date.now()
  // The saved time is the start of that minute. A few seconds later is still "now".
  if (delay <= 0 && delay >= -60_000) {
    deliver()
    return () => {}
  }
  if (delay < -60_000) {
    if (reminder.date) return () => {}
    target.setDate(target.getDate() + 1)
    delay = target.getTime() - Date.now()
  }

  let stopNext = () => {}
  const timerId = window.setTimeout(() => {
    stopNext = scheduleReminderNotification(reminder, onFire)
  }, Math.min(delay, 2_147_483_647))

  return () => {
    window.clearTimeout(timerId)
    stopNext()
  }
}
