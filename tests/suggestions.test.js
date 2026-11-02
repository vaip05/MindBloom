import { describe, expect, it } from 'vitest'
import { buildSuggestions } from '../src/lib/suggestions'
import { calculateWellnessAverages } from '../src/lib/wellnessAverages'

describe('suggestions based on mood and stress averages', () => {
  const referenceDate = new Date('2026-11-02T15:00:00')

  it('suggests breathing support when weekly average stress is high', () => {
    const recentEntries = [
      {
        moodId: 'okay',
        moodValue: 3,
        stressLevel: 4,
        createdAt: '2026-11-02T09:00:00',
      },
      {
        moodId: 'okay',
        moodValue: 3,
        stressLevel: 4,
        createdAt: '2026-10-31T09:00:00',
      },
      {
        moodId: 'okay',
        moodValue: 3,
        stressLevel: 4,
        createdAt: '2026-10-29T09:00:00',
      },
    ]

    const averages = calculateWellnessAverages(
      recentEntries,
      referenceDate,
    )

    const suggestions = buildSuggestions({
      moodId: 'okay',
      stressLevel: 4,
      recentEntries,
      averages,
      now: referenceDate,
    })

    expect(
      suggestions.some((item) => item.id === 'stress-pattern'),
    ).toBe(true)
  })

  it('uses daily average stress for an elevated-stress suggestion', () => {
    const recentEntries = [
      {
        moodId: 'okay',
        moodValue: 3,
        stressLevel: 4,
        createdAt: '2026-11-02T09:00:00',
      },
    ]

    const averages = calculateWellnessAverages(
      recentEntries,
      referenceDate,
    )

    const suggestions = buildSuggestions({
      moodId: 'okay',
      stressLevel: 4,
      recentEntries,
      averages,
      now: referenceDate,
    })

    expect(
      suggestions.some((item) => item.id === 'stress-high'),
    ).toBe(true)
  })

  it('suggests extra care when weekly average mood is low', () => {
    const recentEntries = [
      {
        moodId: 'tough',
        moodValue: 1,
        stressLevel: 4,
        createdAt: '2026-11-02T09:00:00',
      },
      {
        moodId: 'tough',
        moodValue: 1,
        stressLevel: 4,
        createdAt: '2026-10-31T09:00:00',
      },
      {
        moodId: 'tough',
        moodValue: 1,
        stressLevel: 4,
        createdAt: '2026-10-29T09:00:00',
      },
    ]

    const averages = calculateWellnessAverages(
      recentEntries,
      referenceDate,
    )

    const suggestions = buildSuggestions({
      moodId: 'tough',
      stressLevel: 4,
      recentEntries,
      averages,
      now: referenceDate,
    })

    expect(
      suggestions.some((item) => item.id === 'low-mood-streak'),
    ).toBe(true)
  })

  it("recognizes when today's mood average is higher than the weekly average", () => {
    const recentEntries = [
      {
        moodId: 'great',
        moodValue: 4,
        stressLevel: 2,
        createdAt: '2026-11-02T09:00:00',
      },
      {
        moodId: 'okay',
        moodValue: 2,
        stressLevel: 3,
        createdAt: '2026-10-31T09:00:00',
      },
      {
        moodId: 'okay',
        moodValue: 2,
        stressLevel: 3,
        createdAt: '2026-10-29T09:00:00',
      },
    ]

    const averages = calculateWellnessAverages(
      recentEntries,
      referenceDate,
    )

    const suggestions = buildSuggestions({
      moodId: 'great',
      stressLevel: 2,
      recentEntries,
      averages,
      now: referenceDate,
    })

    expect(
      suggestions.some((item) => item.id === 'mood-rising'),
    ).toBe(true)
  })
})