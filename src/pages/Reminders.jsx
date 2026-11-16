import { useEffect, useRef, useState } from 'react'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.mjs'
import Minus from 'lucide-react/dist/esm/icons/minus.mjs'
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { deleteReminder, saveReminder } from '../services/firestoreServices'
import { reminderDateTime, registerPushNotifications, todayDateInput } from '../lib/notifications'
import { syncReminderSchedule } from '../lib/reminderSchedule'

const MESSAGE_MAX = 180
const REMINDER_LIMIT = 20
const DEFAULT_MESSAGE = 'Take a moment for yourself.'
const BLOOM_COLORS = [
  'var(--color-bloom-petal-pink)',
  'var(--color-bloom-petal-yellow)',
  'var(--color-bloom-petal-lilac)',
  'var(--color-bloom-petal-green)',
]

const DAY_SKY = 'bg-gradient-to-b from-bloom-blue-soft to-bloom-green-soft'

function reminderWhen(date, time) {
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '')
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time || '')
  if (!dayMatch || !timeMatch) {
    return { day: 'Choose a day', clock: 'Choose a time', at: null }
  }
  const value = new Date(
    Number(dayMatch[1]),
    Number(dayMatch[2]) - 1,
    Number(dayMatch[3]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  )
  if (Number.isNaN(value.getTime())) {
    return { day: 'Choose a day', clock: 'Choose a time', at: null }
  }
  return {
    day: value.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
    clock: value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    at: value,
  }
}

function hasGoneOut(reminder, now) {
  if (!reminder.id || !reminder.enabled) return false
  const when = reminderDateTime(reminder)
  return Boolean(when && when.getTime() <= now - 2_000)
}

function savedSettings(reminder) {
  return {
    date: reminder.date,
    time: reminder.time,
    message: reminder.message,
    enabled: Boolean(reminder.enabled),
    timezone: reminder.timezone,
  }
}

function isUnchanged(reminder) {
  if (!reminder.saved) return false
  const current = savedSettings(reminder)
  return (
    current.date === reminder.saved.date &&
    current.time === reminder.saved.time &&
    current.message === reminder.saved.message &&
    current.enabled === reminder.saved.enabled
  )
}

function reminderStatus(reminder, now) {
  const when = reminderDateTime(reminder)
  const passed = Boolean(when && when.getTime() < now - 60_000)
  if (passed && !reminder.id) return 'expired'
  if (!reminder.enabled) return passed ? 'missed' : 'paused'
  return 'waiting'
}

const STATUS = {
  waiting: {
    label: 'Will send',
    detail: 'This bloom sends your note at the time below.',
    sky: DAY_SKY,
  },
  paused: {
    label: 'Paused',
    detail: 'This sprout stays quiet until you turn it on.',
    sky: DAY_SKY,
  },
  missed: {
    label: 'Not sent',
    detail: 'This time passed while the reminder was off.',
    sky: DAY_SKY,
  },
  expired: {
    label: 'Choose a later time',
    detail: 'This time has already passed.',
    sky: DAY_SKY,
  },
}

function GardenSky({ className = '', children }) {
  return <div className={`relative overflow-hidden ${className}`}>{children}</div>
}

function PlotDrawing({ status, color }) {
  return (
    <svg viewBox="0 0 320 150" className="w-full" aria-hidden="true">
      <g stroke="var(--color-bloom-sun)" strokeWidth="2" strokeLinecap="round" className="animate-soft-pulse motion-reduce:animate-none">
        <line x1="250" y1="8" x2="250" y2="16" />
        <line x1="232" y1="16" x2="238" y2="22" />
        <line x1="268" y1="16" x2="262" y2="22" />
      </g>
      <circle cx="250" cy="36" r="16" fill="var(--color-bloom-sun)" />
      <path d="M0 108 C48 68, 96 74, 160 106 C210 78, 258 74, 320 104 L320 150 L0 150 Z" fill="var(--color-bloom-hill)" />
      <path d="M0 122 C56 98, 110 100, 168 120 C214 106, 262 104, 320 122 L320 150 L0 150 Z" fill="var(--color-bloom-petal-pink)" opacity="0.9" />
      <ellipse cx="160" cy="158" rx="168" ry="20" fill="#C5E0C2" />
      <ellipse cx="160" cy="164" rx="130" ry="14" fill="#DDECD7" />
      <g transform="translate(160 144)">
        {status === 'waiting' ? <Bloom color={color} /> : <Sprout />}
      </g>
    </svg>
  )
}

function Bloom({ color }) {
  return (
    <g>
      <path d="M 0 0 Q 5 -40 -1 -78" stroke="#6E9A72" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="-14" cy="-40" rx="11" ry="5.5" fill="var(--color-bloom-petal-green)" transform="rotate(-32 -14 -40)" />
      <g transform="translate(-1 -78)">
        <g className="garden-bloom">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx="0" cy="-12" rx="6.5" ry="10" fill={color} transform={`rotate(${angle})`} />
          ))}
          <circle r="4.5" fill="var(--color-bloom-sun)" />
        </g>
      </g>
    </g>
  )
}

function Sprout() {
  return (
    <g>
      <path d="M 0 0 Q 2 -24 0 -44" stroke="#B7CDB4" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="-7" cy="-44" rx="8" ry="4" fill="#C5E6C4" transform="rotate(-30 -7 -44)" />
      <ellipse cx="7" cy="-44" rx="8" ry="4" fill="#A7D7A8" transform="rotate(30 7 -44)" />
    </g>
  )
}

function blankReminder() {
  return {
    key: crypto.randomUUID(),
    id: null,
    date: todayDateInput(),
    time: '20:00',
    message: DEFAULT_MESSAGE,
    enabled: true,
    saving: false,
    saved: null,
    open: true,
  }
}

function fromSaved(reminder) {
  const date = reminder.date || todayDateInput()
  const time = reminder.time || '20:00'
  const message = reminder.message || DEFAULT_MESSAGE
  const enabled = Boolean(reminder.enabled)
  const timezone = reminder.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  return {
    key: reminder.id,
    id: reminder.id,
    date,
    time,
    message,
    enabled,
    timezone,
    saving: false,
    saved: { date, time, message, enabled },
    open: false,
  }
}

export default function Reminders() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const clearedIds = useRef(new Set())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 2_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const id = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(id)
  }, [notice])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const saved = await syncReminderSchedule(user.uid)
        const items = saved.map(fromSaved)
        const sent = items.filter(
          (item) => hasGoneOut(item, Date.now()) || clearedIds.current.has(item.id),
        )
        const visible = items.filter(
          (item) => !hasGoneOut(item, Date.now()) && !clearedIds.current.has(item.id),
        )
        if (sent.length > 0) {
          await Promise.all(sent.map((item) => deleteReminder(user.uid, item.id)))
          await syncReminderSchedule(user.uid)
        }
        if (!active) return
        setReminders(visible)
      } catch (loadError) {
        if (active) setLoadError(loadError?.message || 'Unable to load reminders.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user.uid, loadAttempt])

  useEffect(() => {
    if (!user) return undefined
    function onSent(event) {
      const id = event.detail?.reminderId
      if (!id || clearedIds.current.has(id)) return
      clearedIds.current.add(id)
      setReminders((current) => current.filter((reminder) => reminder.id !== id))
      deleteReminder(user.uid, id)
        .then(() => syncReminderSchedule(user.uid))
        .catch((clearError) => {
          setError(clearError?.message || 'Unable to clear a sent reminder.')
        })
    }
    window.addEventListener('mindbloom-reminder', onSent)
    return () => window.removeEventListener('mindbloom-reminder', onSent)
  }, [user])

  useEffect(() => {
    if (loading || !user) return
    const sent = reminders.filter(
      (reminder) => hasGoneOut(reminder, now) && !clearedIds.current.has(reminder.id),
    )
    if (sent.length === 0) return
    sent.forEach((reminder) => clearedIds.current.add(reminder.id))
    const ids = new Set(sent.map((reminder) => reminder.id))
    setReminders((current) => current.filter((reminder) => !ids.has(reminder.id)))
    Promise.all(sent.map((reminder) => deleteReminder(user.uid, reminder.id)))
      .then(() => syncReminderSchedule(user.uid))
      .catch((clearError) => {
        setError(clearError?.message || 'Unable to clear a sent reminder.')
      })
  }, [loading, now, reminders, user])

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
        const permission = await registerPushNotifications(user.uid)
        permissionNote = permission.message
      }
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const saved = await saveReminder(user.uid, {
        id: reminder.id,
        enabled: reminder.enabled,
        date: reminder.date,
        time: reminder.time,
        message: trimmed,
        timezone,
      })
      updateReminder(reminder.key, {
        id: saved.id,
        key: saved.id,
        message: trimmed,
        timezone,
        saving: false,
        open: reminder.enabled ? false : reminder.open,
        saved: {
          date: reminder.date,
          time: reminder.time,
          message: trimmed,
          enabled: reminder.enabled,
          timezone,
        },
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
            Leave a note in the garden. It arrives as a browser notification at the time you choose, even when this tab is closed.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-bloom-muted">
            Notifications use a general message so personal reminder text is not exposed on your lock screen.
          </p>
        </div>
        <button
          type="button"
          onClick={addReminder}
          aria-label="Add reminder"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-bloom-border bg-bloom-green-soft text-bloom-navy transition hover:border-bloom-lavender"
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

      {loadError ? (
        <Card className="border border-bloom-border bg-bloom-card p-6">
          <ErrorMessage message={loadError} />
          <Button className="mt-4" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
            Try loading again
          </Button>
        </Card>
      ) : loading ? (
        <LoadingSpinner label="Loading your reminders…" />
      ) : reminders.length === 0 ? (
        <Card className="overflow-hidden border border-bloom-border bg-bloom-card sm:grid sm:grid-cols-[280px_minmax(0,1fr)]">
          <GardenSky className={`h-full ${DAY_SKY}`}>
            <div className="px-4 pt-4 pb-5">
              <PlotDrawing status="paused" color={BLOOM_COLORS[0]} />
              <p className="mt-1 text-center text-sm font-semibold text-bloom-navy/80">The bed is quiet.</p>
            </div>
          </GardenSky>
          <GardenSky className={`h-full ${DAY_SKY}`}>
            <div className="relative flex h-full flex-col justify-center px-5 py-6 sm:px-6">
              <p className="text-lg font-extrabold text-bloom-navy">No notes planted yet.</p>
              <p className="mt-2 text-bloom-navy/80">Add a reminder when you want the garden to send you a note.</p>
              <Button type="button" className="mt-5 self-start" onClick={addReminder}>
                Add a reminder
              </Button>
            </div>
          </GardenSky>
        </Card>
      ) : (
        reminders.map((reminder, index) => {
          const when = reminderWhen(reminder.date, reminder.time)
          const tone = reminderStatus(reminder, now)
          const status = STATUS[tone]
          const saveLocked = tone === 'waiting' && Boolean(reminder.id) && isUnchanged(reminder)
          const expanded = reminder.open !== false
          return (
            <Card
              key={reminder.key}
              aria-label={`Reminder ${index + 1}, ${when.day} at ${when.clock}, ${status.label}`}
              className="overflow-hidden border border-bloom-border bg-bloom-card"
            >
              {expanded ? null : (
                <button
                  type="button"
                  aria-expanded="false"
                  onClick={() => updateReminder(reminder.key, { open: true })}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left ${status.sky}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-extrabold text-bloom-navy">{when.clock}</span>
                    <span className="block text-sm font-semibold text-bloom-navy/80">{when.day}</span>
                    <span className="mt-1 block truncate text-sm text-bloom-navy/75">{reminder.message}</span>
                  </span>
                  <span className="text-xs font-bold tracking-[0.14em] text-bloom-navy/70 uppercase">
                    {tone === 'waiting' ? 'Scheduled' : status.label}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-bloom-navy" aria-hidden="true" />
                </button>
              )}
              {expanded ? (
            <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
              <GardenSky className={`h-full ${status.sky}`}>
                <div className="flex h-full flex-col justify-center px-4 py-5">
                  <PlotDrawing status={tone} color={BLOOM_COLORS[index % BLOOM_COLORS.length]} />
                  <p className="mt-1 text-center text-2xl font-extrabold text-bloom-navy">{when.clock}</p>
                  <p className="text-center text-sm font-semibold text-bloom-navy/80">{when.day}</p>
                  <p className="mt-1 text-center text-xs font-bold tracking-[0.14em] text-bloom-navy/70 uppercase">
                    {status.label}
                  </p>
                </div>
              </GardenSky>
              <GardenSky className={`h-full ${status.sky}`}>
              <form className="relative space-y-5 px-5 py-6 sm:px-6" onSubmit={(event) => handleSave(event, reminder)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-bloom-navy uppercase">
                      Note {index + 1}
                    </p>
                    <p className="mt-1 text-sm text-bloom-navy/75">{status.detail}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {reminder.id ? (
                      <button
                        type="button"
                        aria-expanded="true"
                        aria-label={`Collapse reminder ${index + 1}`}
                        onClick={() => updateReminder(reminder.key, { open: false })}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-bloom-border bg-bloom-card text-bloom-navy transition hover:border-bloom-lavender"
                      >
                        <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeReminder(reminder)}
                      disabled={reminder.saving}
                      aria-label={`Remove reminder ${index + 1}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-bloom-border bg-bloom-card text-bloom-navy transition hover:border-bloom-lavender disabled:opacity-60"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
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
                    className="w-full resize-none rounded-md border border-bloom-paper-line bg-bloom-paper px-4 py-3 text-bloom-navy outline-none focus:border-bloom-lavender focus:ring-2 focus:ring-bloom-lavender/20"
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

                <Button
                  type="submit"
                  disabled={reminder.saving || saveLocked}
                  className={saveLocked ? 'disabled:!bg-bloom-border disabled:!text-bloom-muted disabled:!opacity-100' : ''}
                >
                  {reminder.saving ? 'Saving…' : 'Save reminder'}
                </Button>
              </form>
              </GardenSky>
            </div>
              ) : null}
            </Card>
          )
        })
      )}
    </div>
  )
}
