function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function average(values) {
  const validValues = values.filter(
    (value) => typeof value === 'number' && Number.isFinite(value),
  )

  if (validValues.length === 0) return null

  const total = validValues.reduce((sum, value) => sum + value, 0)
  return Number((total / validValues.length).toFixed(2))
}

function averagesFor(entries) {
  return {
    mood: average(entries.map((entry) => Number(entry.moodValue))),
    stress: average(entries.map((entry) => Number(entry.stressLevel))),
    count: entries.length,
  }
}

export function calculateWellnessAverages(
  entries = [],
  referenceDate = new Date(),
) {
  const today = startOfDay(referenceDate)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 6)

  const datedEntries = entries
    .map((entry) => ({
      entry,
      date: toDate(entry.createdAt) || toDate(entry.localDate),
    }))
    .filter(({ date }) => date !== null)

  const dailyEntries = datedEntries
    .filter(({ date }) => date >= today)
    .map(({ entry }) => entry)

  const weeklyEntries = datedEntries
    .filter(({ date }) => date >= weekStart)
    .map(({ entry }) => entry)

  return {
    daily: averagesFor(dailyEntries),
    weekly: averagesFor(weeklyEntries),
  }
}