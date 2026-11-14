const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const FLOWER_COLORS = ['#F9B4BC', '#FFD4B8', '#F6C95C', '#A7F3D0', '#C4B5FD', '#7EB6E0', '#F9B4BC']

function toLocalDate(value) {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function activityDate(entry) {
  return toLocalDate(entry.localDate) || toLocalDate(entry.completedAt) || toLocalDate(entry.createdAt)
}

function sameDay(date, other) {
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  )
}

function happenedOn(entries, day) {
  return entries.some((entry) => {
    const date = activityDate(entry)
    return date && sameDay(date, day)
  })
}

export function buildGarden({ moods = [], breaths = [], journals = [] } = {}, now = new Date()) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const isToday = index === 6
    const checkIn = happenedOn(moods, date)
    const breath = happenedOn(
      breaths.filter((entry) => entry.completed !== false),
      date,
    )
    const journal = happenedOn(journals, date)
    const tended = [checkIn, breath, journal].filter(Boolean).length

    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      date,
      isToday,
      label: isToday ? 'Today' : WEEKDAY_SHORT[date.getDay()],
      longLabel: isToday ? `Today, ${WEEKDAYS[date.getDay()]}` : WEEKDAYS[date.getDay()],
      checkIn,
      breath,
      journal,
      tended,
      color: FLOWER_COLORS[index],
    }
  })
}

function joinList(items) {
  if (items.length <= 1) return items[0] || ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export function gardenSummary(days) {
  const tended = days.filter((day) => day.tended > 0).length
  if (tended === 0) {
    return 'This week is still a row of sprouts. A check-in, a breath, or a journal page opens the first bloom.'
  }
  if (tended === days.length) {
    return 'All seven days opened. The bouquet is full.'
  }
  const quiet = days.length - tended
  const quietLabel = quiet === 1 ? 'One quiet day stays a sprout.' : `${quiet} quiet days stay sprouts.`
  return `${tended} of ${days.length} days opened a bloom. ${quietLabel}`
}

export function gardenTodayLine(day) {
  if (!day) return ''
  if (day.tended === 3) return 'Today is fully tended: a flower, a leaf, and a petal.'
  if (day.tended === 0) return 'Today is still a sprout. Any one of the three will open it.'

  const has = []
  if (day.checkIn) has.push('a flower')
  if (day.breath) has.push('a leaf')
  if (day.journal) has.push('a petal')
  const missing = []
  if (!day.checkIn) missing.push('a check-in')
  if (!day.breath) missing.push('a breath')
  if (!day.journal) missing.push('a page')
  const missingText = joinList(missing)
  const still = `${missingText.charAt(0).toUpperCase()}${missingText.slice(1)} can still join it.`
  return `Today has ${joinList(has)}. ${still}`
}

export function describeGardenDay(day) {
  if (day.tended === 0) return `${day.longLabel} is a quiet sprout.`
  const parts = []
  if (day.checkIn) parts.push('a check-in')
  if (day.breath) parts.push('a breath')
  if (day.journal) parts.push('a journal page')
  return `${day.longLabel}: ${joinList(parts)}.`
}
