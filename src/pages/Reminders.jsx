import { useEffect, useState } from 'react'
import Minus from 'lucide-react/dist/esm/icons/minus.mjs'
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useAuth } from '../context/AuthContext'
import { deleteReminder, saveReminder } from '../services/firestoreServices'
import { reminderDateTime, requestNotificationPermission, todayDateInput } from '../lib/notifications'
import { syncReminderSchedule } from '../lib/reminderSchedule'

const MESSAGE_MAX = 180
const REMINDER_LIMIT = 20
const DEFAULT_MESSAGE = 'Take a moment for yourself.'

function blankReminder() {
  return {
    key: crypto.randomUUID(),
    id: null,
    date: todayDateInput(),
    time: '20:00',
    message: DEFAULT_MESSAGE,
    enabled: true,
    saving: false,
  }
}

function fromSaved(reminder) {
  return {
    key: reminder.id,
    id: reminder.id,
    date: reminder.date || todayDateInput(),
    time: reminder.time || '20:00',
    message: reminder.message || DEFAULT_MESSAGE,
    enabled: Boolean(reminder.enabled),
    saving: false,
  }
}

export default function Reminders() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const saved = await syncReminderSchedule(user.uid)
        if (!active) return
        setReminders(saved.length > 0 ? saved.map(fromSaved) : [blankReminder()])
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Unable to load reminders.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user.uid])

  function updateReminder(key, patch) {
    setReminders((current) =>
      current.map((reminder) => (reminder.key === key ? { ...reminder, ...patch } : reminder)),
    )
  }

  async function removeReminder(reminder) {
    setError('')
    setNotice('')
    if (!reminder.id) {
      setReminders((current) => current.filter((item) => item.key !== reminder.key))
      return
    }
    updateReminder(reminder.key, { saving: true })
    try {
      await deleteReminder(user.uid, reminder.id)
      setReminders((current) => current.filter((item) => item.key !== reminder.key))
      await syncReminderSchedule(user.uid)
      setNotice('Reminder removed.')
    } catch (removeError) {
      updateReminder(reminder.key, { saving: false })
      setError(removeError?.message || 'Unable to remove the reminder.')
    }
  }

  function addReminder() {
    setError('')
    setNotice('')
    if (reminders.length >= REMINDER_LIMIT) {
      setError(`You can keep up to ${REMINDER_LIMIT} reminders.`)
      return
    }
    setReminders((current) => [...current, blankReminder()])
  }

  async function handleSave(event, reminder) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!reminder.date) {
      setError('Choose a date.')
      return
    }
    if (!reminder.time) {
      setError('Choose a time.')
      return
    }
    const when = reminderDateTime(reminder)
    if (!when || when.getTime() < Date.now() - 60_000) {
      setError('Choose a date and time that has not already passed.')
      return
    }
    const trimmed = reminder.message.trim()
    if (!trimmed) {
      setError('Write a short message.')
      return
    }
    if (trimmed.length > MESSAGE_MAX) {
      setError(`Message must be ${MESSAGE_MAX} characters or fewer.`)
      return
    }

    updateReminder(reminder.key, { saving: true })
    try {
      let permissionNote = ''
      if (reminder.enabled) {
        const permission = await requestNotificationPermission()
        permissionNote = permission.message
      }
      const saved = await saveReminder(user.uid, {
        id: reminder.id,
        enabled: reminder.enabled,
        date: reminder.date,
        time: reminder.time,
        message: trimmed,
      })
      updateReminder(reminder.key, {
        id: saved.id,
        key: saved.id,
        message: trimmed,
        saving: false,
      })
      await syncReminderSchedule(user.uid)
      setNotice(permissionNote ? `Saved. ${permissionNote}` : 'Reminder saved.')
    } catch (saveError) {
      updateReminder(reminder.key, { saving: false })
      setError(saveError?.message || 'Unable to save the reminder.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-bloom-navy">Daily Reminders</h1>
          <p className="mt-2 max-w-2xl text-bloom-navy/80">
            A date, a time, and a short message, sent as a browser notification while this tab is open.
          </p>
        </div>
        <button
          type="button"
          onClick={addReminder}
          aria-label="Add reminder"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-bloom-border bg-white text-bloom-navy transition hover:border-bloom-lavender"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <ErrorMessage message={error} />
      {notice ? (
        <div className="rounded-md border border-bloom-green bg-bloom-green-soft px-4 py-3 text-sm text-bloom-navy">
          {notice}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-bloom-muted">Loading your reminders…</p>
      ) : (
        reminders.map((reminder, index) => (
          <Card
            key={reminder.key}
            className="border border-bloom-border bg-white px-5 py-6 sm:px-6"
          >
            <form className="space-y-6" onSubmit={(event) => handleSave(event, reminder)}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold tracking-[0.16em] text-bloom-navy uppercase">
                  Reminder {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeReminder(reminder)}
                  disabled={reminder.saving}
                  aria-label={`Remove reminder ${index + 1}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-bloom-border bg-white text-bloom-navy transition hover:border-bloom-lavender disabled:opacity-60"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id={`reminder-date-${reminder.key}`}
                  label="Date"
                  type="date"
                  value={reminder.date}
                  min={todayDateInput()}
                  onChange={(event) => updateReminder(reminder.key, { date: event.target.value })}
                  required
                />
                <Input
                  id={`reminder-time-${reminder.key}`}
                  label="Time"
                  type="time"
                  value={reminder.time}
                  onChange={(event) => updateReminder(reminder.key, { time: event.target.value })}
                  required
                />
              </div>

              <label className="block" htmlFor={`reminder-message-${reminder.key}`}>
                <span className="mb-2 block text-sm font-semibold text-bloom-navy">Message</span>
                <textarea
                  id={`reminder-message-${reminder.key}`}
                  value={reminder.message}
                  maxLength={MESSAGE_MAX}
                  rows={3}
                  onChange={(event) => updateReminder(reminder.key, { message: event.target.value })}
                  className="w-full rounded-md border border-bloom-border bg-white px-4 py-3 text-bloom-navy outline-none focus:border-bloom-lavender focus:ring-2 focus:ring-bloom-lavender/20"
                />
                <span className="mt-1.5 block text-right text-xs text-bloom-muted">
                  {reminder.message.length}/{MESSAGE_MAX}
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-bloom-navy">
                <input
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={(event) => updateReminder(reminder.key, { enabled: event.target.checked })}
                  className="h-4 w-4 accent-bloom-lavender"
                />
                Send this reminder
              </label>

              <Button type="submit" disabled={reminder.saving}>
                {reminder.saving ? 'Saving…' : 'Save reminder'}
              </Button>
            </form>
          </Card>
        ))
      )}
    </div>
  )
}
