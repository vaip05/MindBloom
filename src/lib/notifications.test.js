import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reminderDateTime, scheduleReminderNotification, todayDateInput } from './notifications'

vi.mock('./firebase', () => ({ app: null }))
vi.mock('../services/firestoreServices', () => ({ saveNotificationToken: vi.fn() }))

const reminder = { id: 'r1', enabled: true, date: '2026-11-15', time: '21:30' }

describe('reminderDateTime', () => {
  it('builds a local date from the saved date and time', () => {
    expect(reminderDateTime(reminder)).toEqual(new Date(2026, 10, 15, 21, 30))
  })

  it('returns null for a missing or broken time', () => {
    expect(reminderDateTime({ date: '2026-11-15' })).toBeNull()
    expect(reminderDateTime({ date: '2026-11-15', time: 'soon' })).toBeNull()
    expect(reminderDateTime({ date: 'Nov 15', time: '21:30' })).toBeNull()
  })

  it('uses today when no date is saved', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 15, 8, 0) })
    expect(todayDateInput()).toBe('2026-11-15')
    expect(reminderDateTime({ time: '09:00' })).toEqual(new Date(2026, 10, 15, 9, 0))
    vi.useRealTimers()
  })
})

describe('scheduleReminderNotification', () => {
  let heard

  function listen(event) {
    heard.push(event.detail)
  }

  beforeEach(() => {
    heard = []
    window.addEventListener('mindbloom-reminder', listen)
    vi.useFakeTimers({ now: new Date(2026, 10, 15, 21, 0) })
  })

  afterEach(() => {
    window.removeEventListener('mindbloom-reminder', listen)
    vi.useRealTimers()
  })

  it('fires at the chosen time and not before', () => {
    const onFire = vi.fn()
    scheduleReminderNotification(reminder, onFire)

    vi.advanceTimersByTime(29 * 60_000)
    expect(onFire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(60_000)
    expect(onFire).toHaveBeenCalledWith(reminder)
    expect(heard).toEqual([expect.objectContaining({ reminderId: 'r1' })])
  })

  it('fires right away when opened within a minute of the chosen time', () => {
    vi.setSystemTime(new Date(2026, 10, 15, 21, 30, 40))
    const onFire = vi.fn()
    scheduleReminderNotification(reminder, onFire)
    expect(onFire).toHaveBeenCalledTimes(1)
  })

  it('does not fire for a dated reminder that has already passed', () => {
    vi.setSystemTime(new Date(2026, 10, 15, 22, 0))
    const onFire = vi.fn()
    scheduleReminderNotification(reminder, onFire)
    vi.advanceTimersByTime(48 * 60 * 60_000)
    expect(onFire).not.toHaveBeenCalled()
  })

  it('does not fire for a reminder that is turned off', () => {
    const onFire = vi.fn()
    scheduleReminderNotification({ ...reminder, enabled: false }, onFire)
    vi.advanceTimersByTime(60 * 60_000)
    expect(onFire).not.toHaveBeenCalled()
  })

  it('stops when cancelled', () => {
    const onFire = vi.fn()
    const cancel = scheduleReminderNotification(reminder, onFire)
    cancel()
    vi.advanceTimersByTime(60 * 60_000)
    expect(onFire).not.toHaveBeenCalled()
  })
})
