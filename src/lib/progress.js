import { MOODS } from './constants'

function toDayLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

function getEntryDate(entry) {
  const value = entry.createdAt?.toDate?.() || entry.createdAt || entry.localDate
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getWeeklyEntries(entries = []) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  return days.map((day) => {
    const dayEntries = entries.filter((entry) => getEntryDate(entry)?.toDateString() === day.toDateString())
    return { day, latest: dayEntries[dayEntries.length - 1] }
  })
}

export function buildWeeklyMoodData(entries = []) {
  return getWeeklyEntries(entries).map(({ day, latest }) => {
    const mood = MOODS.find((item) => item.id === latest?.moodId)
    return {
      day: toDayLabel(day),
      value: latest?.moodValue ?? null,
      color: mood?.color || '#949cf0',
    }
  })
}

export function buildWeeklyStressData(entries = []) {
  return getWeeklyEntries(entries).map(({ day, latest }) => ({
    day: toDayLabel(day),
    value: latest?.stressLevel ?? null,
  }))
}
