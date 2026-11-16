import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { syncReminderSchedule } from '../lib/reminderSchedule'
import { deleteReminder, saveReminder } from '../services/firestoreServices'
import Reminders from './Reminders'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../lib/firebase', () => ({ app: null }))
vi.mock('../lib/reminderSchedule', () => ({ syncReminderSchedule: vi.fn() }))
vi.mock('../services/firestoreServices', () => ({
  deleteReminder: vi.fn(),
  getReminders: vi.fn(),
  saveReminder: vi.fn(),
  saveNotificationToken: vi.fn(),
}))
vi.mock('../lib/notifications', async (importOriginal) => ({
  ...(await importOriginal()),
  registerPushNotifications: vi.fn().mockResolvedValue({ granted: true, message: '' }),
}))

// "Now" is 9:40 PM on Nov 15.
const NOW = new Date(2026, 10, 15, 21, 40)
const base = { enabled: true, date: '2026-11-15', message: 'Stretch', timezone: 'UTC' }

function card(label) {
  return screen.getByRole('region', { name: new RegExp(label) })
}

async function renderWith(reminders) {
  syncReminderSchedule.mockResolvedValue(reminders)
  render(<Reminders />)
  await screen.findByText('Daily Reminders')
  await waitFor(() => expect(screen.queryByText('Loading your reminders…')).not.toBeInTheDocument())
}

describe('Reminders delivery status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
    useAuth.mockReturnValue({ user: { uid: 'user-1' } })
    deleteReminder.mockResolvedValue()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps past reminders and shows whether each was sent, sending or missed', async () => {
    await renderWith([
      { id: 'later', ...base, time: '22:30' },
      { id: 'sent', ...base, time: '21:00', deliveryStatus: 'sent', lastSentFor: '2026-11-15T21:00' },
      { id: 'sending', ...base, time: '21:35' },
      { id: 'server-missed', ...base, time: '20:00', deliveryStatus: 'missed', deliveryNote: 'No browser was registered for notifications.' },
      { id: 'never-checked', ...base, time: '19:00' },
    ])

    expect(card('Reminder 1,').textContent).toContain('Scheduled')
    expect(card('Reminder 2,').textContent).toContain('Sent')
    expect(card('Reminder 3,').textContent).toContain('Sending…')
    expect(card('Reminder 4,').textContent).toContain('Missed')
    expect(card('Reminder 5,').textContent).toContain('Missed')
    expect(deleteReminder).not.toHaveBeenCalled()
  })

  it('explains why a reminder was missed and lets you dismiss it', async () => {
    const user = userEvent.setup()
    await renderWith([
      { id: 'missed', ...base, time: '20:00', deliveryStatus: 'missed', deliveryNote: 'No browser was registered for notifications.' },
    ])

    await user.click(within(card('Reminder 1,')).getByRole('button', { expanded: false }))
    expect(screen.getByText('No browser was registered for notifications.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'dismiss it' }))
    expect(deleteReminder).toHaveBeenCalledWith('user-1', 'missed')
    await waitFor(() => expect(screen.getByText('No notes planted yet.')).toBeInTheDocument())
  })

  it('reschedules a missed reminder to a new time', async () => {
    const user = userEvent.setup()
    saveReminder.mockResolvedValue({ id: 'missed' })
    await renderWith([{ id: 'missed', ...base, time: '20:00', deliveryStatus: 'missed' }])

    await user.click(within(card('Reminder 1,')).getByRole('button', { expanded: false }))
    expect(screen.getByText('This reminder was not delivered in time.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-16' } })
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '08:00' } })
    await user.click(screen.getByRole('button', { name: 'Save reminder' }))

    expect(saveReminder).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ id: 'missed', date: '2026-11-16', time: '08:00', enabled: true }),
    )
    await waitFor(() => expect(card('Reminder 1,').textContent).toContain('Scheduled'))
  })

  it('marks a reminder sent when this tab delivers it', async () => {
    await renderWith([{ id: 'r1', ...base, time: '21:40' }])
    expect(card('Reminder 1,').textContent).toContain('Scheduled')

    window.dispatchEvent(new CustomEvent('mindbloom-reminder', { detail: { reminderId: 'r1' } }))

    await waitFor(() => expect(card('Reminder 1,').textContent).toContain('Sent'))
    expect(deleteReminder).not.toHaveBeenCalled()
  })

  it('will not save a missed reminder again without a new time', async () => {
    const user = userEvent.setup()
    await renderWith([{ id: 'missed', ...base, time: '20:00', deliveryStatus: 'missed' }])

    await user.click(within(card('Reminder 1,')).getByRole('button', { expanded: false }))
    expect(screen.getByRole('button', { name: 'Save reminder' })).toBeDisabled()
  })
})
