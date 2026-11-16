import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkReminder, runReminderCheck } from '../scripts/reminderCheck'
import { MISSED_NOTES } from '../src/lib/reminderDelivery'

const NOW = new Date('2026-11-16T05:32:00Z') // 9:32 PM Nov 15 in Los Angeles
const dueReminder = {
  enabled: true,
  date: '2026-11-15',
  time: '21:30',
  timezone: 'America/Los_Angeles',
  message: 'Drink some water',
}

function fakeReminder(id, data, uid = 'alice') {
  return {
    id,
    data: () => data,
    ref: { parent: { parent: { id: uid } }, set: vi.fn().mockResolvedValue() },
  }
}

// Just enough of the firebase-admin Firestore and Messaging APIs for the script.
function fakeServices({ reminders = [], tokens = [], results = [] } = {}) {
  const deleteToken = vi.fn().mockResolvedValue()
  const tokenCollection = {
    get: vi.fn().mockResolvedValue({
      docs: tokens.map((token, index) => ({ id: `token-${index}`, data: () => ({ token }) })),
    }),
    doc: vi.fn((id) => ({ delete: () => deleteToken(id) })),
  }
  const database = {
    collection: () => ({ doc: () => ({ collection: () => tokenCollection }) }),
    collectionGroup: vi.fn(() => ({
      where: vi.fn(() => ({ get: vi.fn().mockResolvedValue({ docs: reminders }) })),
    })),
  }
  const messaging = {
    sendEachForMulticast: vi.fn().mockResolvedValue({
      successCount: results.filter((result) => !result.error).length,
      responses: results,
    }),
  }
  return { database, messaging, deleteToken }
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('checkReminder', () => {
  it('sends a due reminder with its message and records it as sent', async () => {
    const reminderSnapshot = fakeReminder('r1', dueReminder)
    const { database, messaging } = fakeServices({ tokens: ['browser-a'], results: [{}] })

    const outcome = await checkReminder({ database, messaging, reminderSnapshot, now: NOW })

    expect(outcome).toBe('sent')
    const message = messaging.sendEachForMulticast.mock.calls[0][0]
    expect(message.tokens).toEqual(['browser-a'])
    expect(message.data).toMatchObject({ body: 'Drink some water', reminderId: 'r1' })
    expect(reminderSnapshot.ref.set).toHaveBeenCalledWith(
      { deliveryStatus: 'sent', lastSentFor: '2026-11-15T21:30', lastSentAt: NOW },
      { merge: true },
    )
  })

  it('does nothing before the reminder is due', async () => {
    const reminderSnapshot = fakeReminder('r1', { ...dueReminder, time: '22:00' })
    const { database, messaging } = fakeServices({ tokens: ['browser-a'], results: [{}] })

    expect(await checkReminder({ database, messaging, reminderSnapshot, now: NOW })).toBe('skipped')
    expect(messaging.sendEachForMulticast).not.toHaveBeenCalled()
    expect(reminderSnapshot.ref.set).not.toHaveBeenCalled()
  })

  it('does not send a reminder that an open tab already delivered', async () => {
    const reminderSnapshot = fakeReminder('r1', { ...dueReminder, deliveryStatus: 'sent' })
    const { database, messaging } = fakeServices({ tokens: ['browser-a'], results: [{}] })

    expect(await checkReminder({ database, messaging, reminderSnapshot, now: NOW })).toBe('skipped')
    expect(messaging.sendEachForMulticast).not.toHaveBeenCalled()
  })

  it('marks a reminder missed when the check runs after the send window', async () => {
    const reminderSnapshot = fakeReminder('r1', { ...dueReminder, time: '21:00' })
    const { database, messaging } = fakeServices({ tokens: ['browser-a'], results: [{}] })

    expect(await checkReminder({ database, messaging, reminderSnapshot, now: NOW })).toBe('missed')
    expect(messaging.sendEachForMulticast).not.toHaveBeenCalled()
    expect(reminderSnapshot.ref.set).toHaveBeenCalledWith(
      { deliveryStatus: 'missed', deliveryNote: MISSED_NOTES.late, updatedAt: NOW },
      { merge: true },
    )
  })

  it('marks a reminder missed when no browser is registered', async () => {
    const reminderSnapshot = fakeReminder('r1', dueReminder)
    const { database, messaging } = fakeServices({ tokens: [] })

    expect(await checkReminder({ database, messaging, reminderSnapshot, now: NOW })).toBe('missed')
    expect(reminderSnapshot.ref.set.mock.calls[0][0].deliveryNote).toBe(MISSED_NOTES.noBrowser)
  })

  it('marks a reminder missed and removes dead browsers when nothing is delivered', async () => {
    const reminderSnapshot = fakeReminder('r1', dueReminder)
    const { database, messaging, deleteToken } = fakeServices({
      tokens: ['old-browser', 'flaky-browser'],
      results: [
        { error: { code: 'messaging/registration-token-not-registered' } },
        { error: { code: 'messaging/internal-error' } },
      ],
    })

    expect(await checkReminder({ database, messaging, reminderSnapshot, now: NOW })).toBe('missed')
    expect(deleteToken).toHaveBeenCalledTimes(1)
    expect(deleteToken).toHaveBeenCalledWith('token-0')
    expect(reminderSnapshot.ref.set.mock.calls[0][0].deliveryNote).toBe(MISSED_NOTES.unreachable)
  })

  it('counts a reminder as sent when at least one browser received it', async () => {
    const reminderSnapshot = fakeReminder('r1', dueReminder)
    const { database, messaging, deleteToken } = fakeServices({
      tokens: ['old-browser', 'phone'],
      results: [{ error: { code: 'messaging/invalid-registration-token' } }, {}],
    })

    expect(await checkReminder({ database, messaging, reminderSnapshot, now: NOW })).toBe('sent')
    expect(deleteToken).toHaveBeenCalledWith('token-0')
  })
})

describe('runReminderCheck', () => {
  it('checks every turned-on reminder and totals the outcomes', async () => {
    const { database, messaging } = fakeServices({
      tokens: ['browser-a'],
      results: [{}],
      reminders: [
        fakeReminder('due', dueReminder),
        fakeReminder('later', { ...dueReminder, time: '23:00' }),
        fakeReminder('late', { ...dueReminder, date: '2026-11-14' }),
      ],
    })

    const totals = await runReminderCheck({ database, messaging, now: NOW })

    expect(database.collectionGroup).toHaveBeenCalledWith('reminders')
    expect(totals).toEqual({ sent: 1, missed: 1, skipped: 1 })
  })
})
