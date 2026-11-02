import { describe, expect, it } from 'vitest'
import { buildSuggestions } from './suggestions'

const NOON = new Date('2026-11-01T12:00:00')
const NINE_PM = new Date('2026-11-01T21:00:00')

function checkIn(moodValue, stressLevel) {
  return { moodValue, stressLevel }
}

function suggestionIds(input) {
  return buildSuggestions({ now: NOON, ...input }).map((suggestion) => suggestion.id)
}

describe('buildSuggestions', () => {
  it('gives a new user starter tips', () => {
    const titles = buildSuggestions({ now: NOON }).map((suggestion) => suggestion.title)

    expect(titles).toEqual([
      'Start with a check-in',
      'Breathe for a minute',
      'Set a reminder',
      'Write it in the notebook',
    ])
  })

  it('puts high stress first and recommends Box Breathing', () => {
    const [firstSuggestion] = buildSuggestions({ moodId: 'good', stressLevel: 4, now: NOON })

    expect(firstSuggestion.id).toBe('stress-high')
    expect(firstSuggestion.body).toContain('Box Breathing')
    expect(firstSuggestion.action.to).toBe('/breathe')
  })

  it('prefers the weekly stress pattern over a single stressful check-in', () => {
    const ids = suggestionIds({
      moodId: 'okay',
      stressLevel: 4,
      recentEntries: [checkIn(3, 4), checkIn(3, 5), checkIn(3, 2), checkIn(3, 4)],
    })

    expect(ids[0]).toBe('stress-pattern')
    expect(ids).not.toContain('stress-high')
  })

  it('does not call two stressful check-ins a pattern', () => {
    const ids = suggestionIds({
      moodId: 'okay',
      stressLevel: 3,
      recentEntries: [checkIn(3, 4), checkIn(3, 5), checkIn(3, 2)],
    })

    expect(ids).not.toContain('stress-pattern')
  })

  it('offers care after three low moods in a row', () => {
    const recentEntries = [checkIn(1, 3), checkIn(2, 3), checkIn(1, 3)]

    expect(suggestionIds({ moodId: 'tough', stressLevel: 3, recentEntries })).toContain(
      'low-mood-streak',
    )
  })

  it('ignores low moods that a better day has interrupted', () => {
    const recentEntries = [checkIn(1, 3), checkIn(4, 3), checkIn(1, 3)]

    expect(suggestionIds({ moodId: 'tough', stressLevel: 3, recentEntries })).not.toContain(
      'low-mood-streak',
    )
  })

  it('notices a mood above the recent average', () => {
    const recentEntries = [checkIn(2, 3), checkIn(3, 3), checkIn(5, 3)]

    expect(suggestionIds({ moodId: 'great', stressLevel: 3, recentEntries })).toContain(
      'mood-rising',
    )
  })

  it('suggests 4-7-8 Breathing only in an unsettled evening', () => {
    const unsettledCheckIn = { moodId: 'okay', stressLevel: 3 }
    const eveningSuggestion = buildSuggestions({ ...unsettledCheckIn, now: NINE_PM }).find(
      (suggestion) => suggestion.id === 'evening-wind-down',
    )

    expect(eveningSuggestion.body).toContain('4-7-8 Breathing')
    expect(suggestionIds(unsettledCheckIn)).not.toContain('evening-wind-down')
    expect(
      buildSuggestions({ moodId: 'great', stressLevel: 1, now: NINE_PM }).map(
        (suggestion) => suggestion.id,
      ),
    ).not.toContain('evening-wind-down')
  })

  it('nudges about breathing only when the history is known to be empty', () => {
    const checkInData = { moodId: 'okay', stressLevel: 3 }

    expect(suggestionIds({ ...checkInData, breathingSessions: [] })).toContain('breathe-nudge')
    expect(suggestionIds({ ...checkInData, breathingSessions: [{ id: 'session' }] })).not.toContain(
      'breathe-nudge',
    )
    expect(suggestionIds(checkInData)).not.toContain('breathe-nudge')
  })

  it('protects a calm day', () => {
    expect(suggestionIds({ moodId: 'great', stressLevel: 1 })).toContain('stress-low')
  })

  it('caps rule matches so tips for the current mood still appear', () => {
    const suggestions = buildSuggestions({
      moodId: 'tough',
      stressLevel: 5,
      recentEntries: [checkIn(1, 5), checkIn(1, 5), checkIn(1, 5)],
      breathingSessions: [],
      now: NINE_PM,
    })

    expect(suggestions.map((suggestion) => suggestion.id).slice(0, 2)).toEqual([
      'stress-pattern',
      'low-mood-streak',
    ])
    expect(suggestions.some((suggestion) => suggestion.id.startsWith('tough-'))).toBe(true)
    expect(suggestions).toHaveLength(5)
  })

  it('always ends with the journal suggestion', () => {
    const suggestions = buildSuggestions({ moodId: 'okay', stressLevel: 3, now: NOON })

    expect(suggestions.at(-1).action.type).toBe('journal')
  })

  it('shows different tips when refreshed', () => {
    const firstPageIds = suggestionIds({ moodId: 'okay', stressLevel: 3, page: 0 })
    const secondPageIds = suggestionIds({ moodId: 'okay', stressLevel: 3, page: 1 })

    expect(secondPageIds).not.toEqual(firstPageIds)
  })

  it('cycles back to the first tips after the last page', () => {
    const firstPageIds = suggestionIds({ moodId: 'okay', stressLevel: 3, page: 0 })
    const wrappedPageIds = suggestionIds({ moodId: 'okay', stressLevel: 3, page: 2 })

    expect(wrappedPageIds).toEqual(firstPageIds)
  })

  it('never repeats a tag within one set of suggestions', () => {
    const tags = buildSuggestions({ moodId: 'okay', stressLevel: 4, now: NOON }).map(
      (suggestion) => suggestion.tag,
    )

    expect(new Set(tags).size).toBe(tags.length)
  })

  it('explains why every suggestion is shown', () => {
    for (const suggestion of buildSuggestions({ moodId: 'good', stressLevel: 5, now: NOON })) {
      expect(suggestion.reason).toMatch(/^Shown because/)
    }
  })

  // Firestore rejects documents containing undefined, which would break saving a check-in.
  it('produces data Firestore can store', () => {
    const inputs = [
      { now: NOON },
      { moodId: 'tough', stressLevel: 5, now: NINE_PM, breathingSessions: [] },
    ]

    for (const input of inputs) {
      for (const suggestion of buildSuggestions(input)) {
        expect(Object.values(suggestion)).not.toContain(undefined)
      }
    }
  })
})
