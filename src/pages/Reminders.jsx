import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import {
  getReminders,
  saveReminder,
} from '../services/firestoreServices'
import {
  notificationsSupported,
  requestNotificationPermission,
  scheduleReminderNotification,
  showWellnessNotification,
} from '../lib/notifications'

const defaultReminder = {
  enabled: false,
  time: '09:00',
  message: 'Take a moment for yourself.',
}

export default function Reminders() {
  const { user } = useAuth()

  const [reminder, setReminder] = useState(defaultReminder)
  const [reminderId, setReminderId] = useState(null)
  const [hasSavedReminder, setHasSavedReminder] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [testingNotification, setTestingNotification] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReminder() {
      setLoading(true)
      setLoadError('')
      setHasSavedReminder(false)
      setReminderId(null)
      setReminder(defaultReminder)
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const reminders = await getReminders(user.uid)

        if (reminders.length > 0) {
          const savedReminder = reminders[0]
          setHasSavedReminder(true)

          setReminder({
            enabled: Boolean(savedReminder.enabled),
            time: savedReminder.time || defaultReminder.time,
            message: savedReminder.message || defaultReminder.message,
          })

          setReminderId(savedReminder.id)
        }
      } catch (loadError) {
        setLoadError(loadError.message || 'Unable to load reminder settings.')
      } finally {
        setLoading(false)
      }
    }

    loadReminder()
  }, [user, loadAttempt])

  useEffect(() => {
    if (!reminder.enabled || !reminder.time) {
      return undefined
    }

    return scheduleReminderNotification(reminder, () => {
      setStatus('Your wellness reminder was sent.')
    })
  }, [reminder])

  function updateReminder(field, value) {
    setReminder((current) => ({
      ...current,
      [field]: value,
    }))

    setStatus('')
    setError('')
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!user) {
      setError('You must be logged in to save reminder settings.')
      return
    }

    setSaving(true)
    setStatus('')
    setError('')

    try {
      if (reminder.enabled) {
        const permission = await requestNotificationPermission()

        if (!permission.granted) {
          setError(permission.message)
          return
        }
      }

      const savedReminder = await saveReminder(user.uid, {
        id: reminderId,
        enabled: reminder.enabled,
        time: reminder.time,
        message: reminder.message,
      })

      setReminderId(savedReminder.id)
      setHasSavedReminder(true)

      setReminder({
        enabled: reminder.enabled,
        time: savedReminder.time || reminder.time,
        message: savedReminder.message || reminder.message,
      })

      setStatus('Reminder settings saved.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save reminder settings.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTestNotification() {
    setStatus('')
    setError('')
    setTestingNotification(true)

    try {
      const permission = await requestNotificationPermission()

      if (!permission.granted) {
        setError(permission.message)
        return
      }

      const notificationShown = showWellnessNotification({
        title: 'MindBloom test reminder',
        body: 'Take a moment for yourself.',
      })

      if (notificationShown) {
        setStatus('Test notification sent. The notification uses generic text for privacy.')
      } else {
        setError('The notification could not be displayed.')
      }
    } catch (testError) {
      setError(testError.message || 'Unable to test the notification.')
    } finally {
      setTestingNotification(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6">
        <LoadingSpinner label="Loading reminder settings…" />
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 px-6 py-6">
        <h1 className="text-4xl font-semibold text-bloom-ink">Daily Reminders</h1>
        <ErrorMessage message={loadError} />
        <Button onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
          Try loading again
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-start justify-between gap-8">
        <div>
          <h1 className="text-4xl font-semibold text-bloom-ink">
            Daily Reminders
          </h1>

          <p className="mt-2 text-lg text-bloom-ink-muted">
            Choose when MindBloom should remind you to take a moment for yourself.
          </p>
        </div>

        <div className="hidden shrink-0 md:block">
          <img
            src="/favicon.svg"
            alt="MindBloom"
            className="h-28 w-28 object-contain"
          />
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="mt-6 rounded-3xl border border-bloom-border bg-white p-6 shadow-sm"
      >
        {!hasSavedReminder ? (
          <p className="mb-5 rounded-2xl bg-bloom-blue-soft px-4 py-3 text-sm text-bloom-ink">
            No reminder has been saved yet. The settings below are defaults and will not be active until you save them.
          </p>
        ) : null}

        <label className="flex items-center justify-between gap-6">
          <span className="text-xl font-medium text-bloom-ink">
            Enable daily reminder
          </span>

          <input
            type="checkbox"
            checked={reminder.enabled}
            onChange={(event) =>
              updateReminder('enabled', event.target.checked)
            }
            className="h-6 w-6 accent-bloom-yellow"
          />
        </label>

        <p className="mt-2 text-base text-bloom-ink-muted">
          Browser notifications must be enabled to receive reminders.
        </p>
        <p className="mt-2 text-sm text-bloom-ink-muted">
          Notifications use a general message to protect your privacy; your custom reminder text stays in your account.
        </p>

        <div className="mt-5">
          <label
            htmlFor="reminder-time"
            className="block text-xl font-medium text-bloom-ink"
          >
            Reminder time
          </label>

          <input
            id="reminder-time"
            type="time"
            value={reminder.time}
            onChange={(event) =>
              updateReminder('time', event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-bloom-border px-4 py-3 text-lg text-bloom-ink outline-none focus:border-bloom-yellow"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="reminder-message"
            className="block text-xl font-medium text-bloom-ink"
          >
            Reminder message
          </label>

          <textarea
            id="reminder-message"
            value={reminder.message}
            onChange={(event) =>
              updateReminder('message', event.target.value)
            }
            rows={3}
            maxLength={160}
            className="mt-2 w-full resize-none rounded-2xl border border-bloom-border px-4 py-3 text-lg text-bloom-ink outline-none focus:border-bloom-yellow"
          />

          <p className="mt-1 text-right text-sm text-bloom-ink-muted">
            {reminder.message.length}/160
          </p>
        </div>

        {!notificationsSupported() && (
          <p className="mt-4 text-base text-red-600">
            This browser does not support notifications.
          </p>
        )}

        {error && (
          <p className="mt-4 text-center text-base text-red-600">
            {error}
          </p>
        )}

        {status && (
          <p className="mt-4 text-center text-base text-green-600">
            {status}
          </p>
        )}

        <div className="mt-5 flex w-full justify-center">
<button
  type="submit"
  disabled={saving}
  className="rounded-2xl border-2 border-[#f5b6c2] bg-[#f5b6c2] px-6 py-3 text-lg text-[#202033] transition hover:bg-[#f29aaa] disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving ? 'Saving...' : 'Save reminder'}
</button>
        </div>

        <div className="mt-3 flex w-full justify-center">
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={testingNotification}
            className="rounded-2xl border-2 border-[#959CEA] bg-[#959CEA] px-6 py-3 text-lg text-white transition hover:bg-[#858DDE]"
          >
            {testingNotification ? 'Testing…' : 'Test notification'}
          </button>
        </div>
      </form>

      <p className="mt-3 text-center text-base text-bloom-ink-muted">
        Notifications are scheduled while this browser tab remains open.
      </p>
    </main>
  )
}