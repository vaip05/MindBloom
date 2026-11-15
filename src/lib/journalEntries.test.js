import { describe, expect, it } from 'vitest'
import { createJournalExport, filterJournalEntries } from './journalEntries'

const entries = [
  { id: 'one', title: 'Morning thoughts', body: 'A quiet start to the day.', kind: 'free' },
  { id: 'two', title: 'A prompted page', body: 'Today I felt supported.', kind: 'prompt', prompt: 'What helped today?' },
  { id: 'three', title: 'Suggestion reflection', body: 'I felt calmer after breathing.', kind: 'suggestion', moodId: 'good' },
]

describe('filterJournalEntries', () => {
  it('matches title and body without case sensitivity', () => {
    expect(filterJournalEntries(entries, 'MORNING').map((entry) => entry.id)).toEqual(['one'])
    expect(filterJournalEntries(entries, 'SUPPORTED').map((entry) => entry.id)).toEqual(['two'])
  })

  it('trims the search term and returns all entries for an empty query', () => {
    expect(filterJournalEntries(entries, '  calmer  ').map((entry) => entry.id)).toEqual(['three'])
    expect(filterJournalEntries(entries, '   ')).toBe(entries)
  })

  it('returns an empty result when there are no matches', () => {
    expect(filterJournalEntries(entries, 'not found')).toEqual([])
  })
})

describe('createJournalExport', () => {
  it('exports all personal entry fields and converts dates to ISO strings', () => {
    const createdAt = new Date('2026-11-10T08:30:00.000Z')
    const parsed = JSON.parse(createJournalExport([
      { ...entries[1], createdAt, updatedAt: { toDate: () => createdAt } },
    ]))

    expect(parsed.format).toBe('MindBloom journal export')
    expect(parsed.version).toBe(1)
    expect(parsed.exportedAt).toBeTruthy()
    expect(parsed.entries).toEqual([{
      id: 'two',
      title: 'A prompted page',
      body: 'Today I felt supported.',
      kind: 'prompt',
      prompt: 'What helped today?',
      createdAt: '2026-11-10T08:30:00.000Z',
      updatedAt: '2026-11-10T08:30:00.000Z',
    }])
  })

  it('returns a valid empty export when a user has no entries', () => {
    expect(JSON.parse(createJournalExport([])).entries).toEqual([])
  })
})
