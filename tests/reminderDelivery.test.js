import { describe, expect, it } from 'vitest'
import {
  deliveryStep,
  isDelivered,
  localParts,
  occurrenceKey,
  SEND_WINDOW_MINUTES,
} from '../src/lib/reminderDelivery'

// 9:30 PM on Nov 15 in Los Angeles is 05:30 UTC on Nov 16.
const reminder = {
  enabled: true,
  date: '2026-11-15',
  time: '21:30',
  timezone: 'America/Los_Angeles',
}

describe('localParts', () => {
  it('reads the date and minutes in the reminder time zone', () => {
    expect(localParts(new Date('2026-11-16T05:30:00Z'), 'America/Los_Angeles')).toEqual({
      date: '2026-11-15',
      minutes: 21 * 60 + 30,
    })
  })

  it('falls back to UTC without a time zone', () => {
    expect(localParts(new Date('2026-11-16T05:30:00Z'))).toEqual({ date: '2026-11-16', minutes: 330 })
  })
})

describe('deliveryStep', () => {
  it('waits until the chosen local time', () => {
    expect(deliveryStep(reminder, new Date('2026-11-16T05:29:00Z'))).toBe('waiting')
    expect(deliveryStep(reminder, new Date('2026-11-14T05:30:00Z'))).toBe('waiting')
  })

  it('sends from the chosen time through the end of the window', () => {
    expect(deliveryStep(reminder, new Date('2026-11-16T05:30:00Z'))).toBe('send')
    expect(deliveryStep(reminder, new Date(`2026-11-16T05:${30 + SEND_WINDOW_MINUTES}:00Z`))).toBe('send')
  })

  it('is late once the window has passed', () => {
    expect(deliveryStep(reminder, new Date(`2026-11-16T05:${31 + SEND_WINDOW_MINUTES}:00Z`))).toBe('late')
    expect(deliveryStep(reminder, new Date('2026-11-18T05:30:00Z'))).toBe('late')
  })

  it('keeps sending across midnight', () => {
    const lateNight = { ...reminder, time: '23:55' }
    // 00:03 on Nov 16 in Los Angeles.
    expect(deliveryStep(lateNight, new Date('2026-11-16T08:03:00Z'))).toBe('send')
  })

  it('uses the reminder time zone, not UTC', () => {
    const utcReminder = { ...reminder, timezone: 'UTC' }
    expect(deliveryStep(utcReminder, new Date('2026-11-16T05:30:00Z'))).toBe('late')
  })

  it('ignores reminders that are off or incomplete', () => {
    expect(deliveryStep({ ...reminder, enabled: false }, new Date('2026-11-16T05:30:00Z'))).toBe('off')
    expect(deliveryStep({ ...reminder, time: '' }, new Date('2026-11-16T05:30:00Z'))).toBe('off')
    expect(deliveryStep(null)).toBe('off')
  })

  it('never handles the same reminder twice', () => {
    const now = new Date('2026-11-16T05:31:00Z')
    expect(deliveryStep({ ...reminder, deliveryStatus: 'sent' }, now)).toBe('done')
    expect(deliveryStep({ ...reminder, deliveryStatus: 'missed' }, now)).toBe('done')
    expect(deliveryStep({ ...reminder, lastSentFor: '2026-11-15T21:30' }, now)).toBe('done')
  })

  it('sends a rescheduled reminder that was sent for an earlier time', () => {
    const rescheduled = { ...reminder, lastSentFor: '2026-11-14T21:30' }
    expect(isDelivered(rescheduled)).toBe(false)
    expect(deliveryStep(rescheduled, new Date('2026-11-16T05:30:00Z'))).toBe('send')
  })
})

describe('occurrenceKey', () => {
  it('combines the date and time', () => {
    expect(occurrenceKey(reminder)).toBe('2026-11-15T21:30')
  })
})
