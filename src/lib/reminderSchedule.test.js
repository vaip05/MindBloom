import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getReminders, markReminderSent } from '../services/firestoreServices'
import { clearReminderSchedule, syncReminderSchedule } from './reminderSchedule'

vi.mock('./firebase', () => ({ app: null }))
vi.mock('../services/firestoreServices', () => ({
  getReminders: vi.fn(),
  markReminderSent: vi.fn(),
  saveNotificationToken: vi.fn(),
}))

const base = { enabled: true, date: '2026-11-15', time: '21:30', timezone: 'America/Los_Angeles' }

describe('syncReminderSchedule', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 10, 15, 21, 0) })
    markReminderSent.mockResolvedValue()
  })

  afterEach(() => {
    clearReminderSchedule()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('records a reminder as sent when this tab delivers it', async () => {
    getReminders.mockResolvedValue([{ id: 'r1', ...base }])

    const reminders = await syncReminderSchedule('alice')
    expect(reminders).toHaveLength(1)

    vi.advanceTimersByTime(30 * 60_000)
    expect(markReminderSent).toHaveBeenCalledWith('alice', expect.objectContaining({ id: 'r1' }))
  })

  it('skips reminders that were already sent or marked missed', async () => {
    getReminders.mockResolvedValue([
      { id: 'sent', ...base, deliveryStatus: 'sent' },
      { id: 'missed', ...base, deliveryStatus: 'missed' },
      { id: 'off', ...base, enabled: false },
    ])

    await syncReminderSchedule('alice')
    vi.advanceTimersByTime(30 * 60_000)
    expect(markReminderSent).not.toHaveBeenCalled()
  })

  it('replaces the old schedule when synced again', async () => {
    getReminders.mockResolvedValueOnce([{ id: 'r1', ...base }]).mockResolvedValueOnce([])

    await syncReminderSchedule('alice')
    await syncReminderSchedule('alice')
    vi.advanceTimersByTime(30 * 60_000)
    expect(markReminderSent).not.toHaveBeenCalled()
  })
})
