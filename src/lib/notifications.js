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

export function showWellnessNotification({ title, body }) {
  if (!notificationsSupported() || Notification.permission !== 'granted') {
    return false
  }

  try {
    new Notification(title || 'MindBloom reminder', {
      body: body || 'Take a moment for yourself today.',
      icon: '/favicon.svg',
      tag: 'mindbloom-reminder',
    })
    return true
  } catch {
    return false
  }
}

/** Schedule a same-day browser notification for a HH:mm local time. */
export function scheduleReminderNotification(reminder, onFire) {
  if (!reminder?.enabled || !reminder?.time) return () => {}

  const [hours, minutes] = reminder.time.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)

  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }

  const delay = target.getTime() - now.getTime()
  const timerId = window.setTimeout(() => {
    showWellnessNotification({
      title: 'MindBloom wellness reminder',
      body: reminder.message || 'Take a moment for yourself.',
    })
    onFire?.(reminder)
  }, delay)

  return () => window.clearTimeout(timerId)
}
