import { describe, expect, it } from 'vitest'
import { calculateWellnessAverages } from '../src/lib/wellnessAverages'

describe('calculateWellnessAverages', () => {
  const referenceDate = new Date('2026-11-02T15:00:00')

  it('calculates daily mood and stress averages', () => {
    const entries = [
      {
        moodValue: 4,
        stressLevel: 2,
        createdAt: '2026-11-02T09:00:00',
      },
      {
        moodValue: 2,
        stressLevel: 4,
        createdAt: '2026-11-02T12:00:00',
      },
    ]

    const result = calculateWellnessAverages(entries, referenceDate)

    expect(result.daily.mood).toBe(3)
    expect(result.daily.stress).toBe(3)
    expect(result.daily.count).toBe(2)
  })

  it('calculates weekly averages using the last seven days', () => {
    const entries = [
      {
        moodValue: 5,
        stressLevel: 1,
        createdAt: '2026-11-02T09:00:00',
      },
      {
        moodValue: 3,
        stressLevel: 3,
        createdAt: '2026-10-30T09:00:00',
      },
      {
        moodValue: 1,
        stressLevel: 5,
        createdAt: '2026-10-27T09:00:00',
      },
      {
        moodValue: 5,
        stressLevel: 5,
        createdAt: '2026-10-20T09:00:00',
      },
    ]

    const result = calculateWellnessAverages(entries, referenceDate)

    expect(result.weekly.mood).toBe(3)
    expect(result.weekly.stress).toBe(3)
    expect(result.weekly.count).toBe(3)
  })

  it('returns null averages when there are no entries', () => {
    const result = calculateWellnessAverages([], referenceDate)

    expect(result.daily.mood).toBeNull()
    expect(result.daily.stress).toBeNull()
    expect(result.weekly.mood).toBeNull()
    expect(result.weekly.stress).toBeNull()
    expect(result.daily.count).toBe(0)
    expect(result.weekly.count).toBe(0)
  })
})