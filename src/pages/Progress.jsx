import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MoodFace from '../components/MoodFace'
import MoodChart, { buildWeeklyMoodData } from '../components/MoodChart'
import StressChart, { buildWeeklyStressData } from '../components/StressChart'
import Card from '../components/ui/Card'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { MOODS, STRESS_LEVELS } from '../lib/constants'
import { getRecentMoodEntries } from '../services/firestoreServices'

function getEntryDate(entry) {
  const value = entry.createdAt?.toDate?.() || entry.createdAt || entry.localDate
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatEntryDate(entry) {
  const date = getEntryDate(entry)
  return date
    ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Date unavailable'
}

function average(values) {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default function Progress() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadHistory() {
      if (!user) {
        setEntries([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const history = await getRecentMoodEntries(user.uid, 30)
        if (active) setEntries(history)
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Unable to load your mood and stress history.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      active = false
    }
  }, [user])

  const moodData = useMemo(() => buildWeeklyMoodData(entries), [entries])
  const stressData = useMemo(() => buildWeeklyStressData(entries), [entries])
  const stressValues = entries
    .map((entry) => Number(entry.stressLevel))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5)
  const averageStress = average(stressValues)
  const latestEntry = entries[entries.length - 1]
  const latestMood = MOODS.find((mood) => mood.id === latestEntry?.moodId)
  const loggedDays = new Set(entries.map((entry) => getEntryDate(entry)?.toDateString()).filter(Boolean)).size

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-bloom-lavender">Your wellbeing</p>
        <h1 className="text-3xl font-black text-bloom-navy sm:text-4xl">Progress Charts</h1>
        <p className="max-w-3xl text-bloom-navy/75">
          See your saved mood and stress trends for the past week, and review your recent check-ins.
        </p>
      </header>

      {loading ? <LoadingSpinner label="Loading your mood and stress history…" /> : (
        <>
          <ErrorMessage message={error} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-bloom-border bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-bloom-muted">Latest mood</p>
              <div className="mt-3 flex items-center gap-3">
                {latestMood ? <MoodFace mood={latestMood} className="h-12 w-12" /> : <span className="text-3xl">—</span>}
                <div>
                  <p className="font-extrabold text-bloom-navy">{latestMood?.label || 'No check-ins yet'}</p>
                  <p className="text-xs text-bloom-muted">{latestEntry ? formatEntryDate(latestEntry) : 'Your latest mood will show here'}</p>
                </div>
              </div>
            </Card>
            <Card className="border border-bloom-border bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-bloom-muted">Average stress</p>
              <p className="mt-3 text-3xl font-black text-bloom-navy">{averageStress == null ? '—' : averageStress.toFixed(1)}<span className="ml-2 text-sm font-semibold text-bloom-muted">/ 5</span></p>
              <p className="text-xs text-bloom-muted">From {stressValues.length} recent check-ins</p>
            </Card>
            <Card className="border border-bloom-border bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-bloom-muted">Check-in days</p>
              <p className="mt-3 text-3xl font-black text-bloom-navy">{loggedDays}</p>
              <p className="text-xs text-bloom-muted">Days with a saved entry in the past 30 days</p>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-bloom-muted">Mood</p>
              <h2 className="mb-3 mt-1 text-xl font-extrabold text-bloom-navy">Past 7 days</h2>
              <MoodChart data={moodData} />
            </Card>
            <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-bloom-muted">Stress</p>
              <h2 className="mb-3 mt-1 text-xl font-extrabold text-bloom-navy">Past 7 days</h2>
              <StressChart data={stressData} />
            </Card>
          </div>

          <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-bloom-muted">History</p>
                <h2 className="mt-1 text-xl font-extrabold text-bloom-navy">Recent check-ins</h2>
                <p className="mt-1 text-sm text-bloom-muted">Showing saved entries from the past 30 days.</p>
              </div>
              <Link to="/mood" className="text-sm font-bold text-bloom-lavender hover:underline">Log a check-in →</Link>
            </div>

            {entries.length === 0 ? (
              <div className="rounded-2xl bg-bloom-bg/70 px-4 py-8 text-center">
                <p className="font-semibold text-bloom-navy">No check-ins to show yet</p>
                <p className="mt-1 text-sm text-bloom-muted">Save a mood and stress check-in to start building your history.</p>
                <Link to="/mood" className="mt-4 inline-flex rounded-full bg-bloom-lavender px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">Go to Mood & Stress</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-bloom-border text-xs uppercase tracking-wide text-bloom-muted">
                      <th className="px-3 py-3 font-bold">Date</th>
                      <th className="px-3 py-3 font-bold">Mood</th>
                      <th className="px-3 py-3 font-bold">Stress</th>
                      <th className="px-3 py-3 font-bold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...entries].reverse().map((entry) => {
                      const mood = MOODS.find((item) => item.id === entry.moodId)
                      const stress = STRESS_LEVELS.find((item) => item.value === Number(entry.stressLevel))
                      return (
                        <tr key={entry.id} className="border-b border-bloom-border/70 last:border-0">
                          <td className="whitespace-nowrap px-3 py-3 text-bloom-muted">{formatEntryDate(entry)}</td>
                          <td className="px-3 py-3 font-semibold text-bloom-navy">
                            {mood ? (
                              <span className="inline-flex items-center gap-2">
                                <MoodFace mood={mood} className="h-6 w-6" />
                                {mood.label}
                              </span>
                            ) : (
                              'Unknown mood'
                            )}
                          </td>
                          <td className="px-3 py-3 text-bloom-navy">{stress ? `${stress.value} · ${stress.label}` : '—'}</td>
                          <td className="max-w-[240px] truncate px-3 py-3 text-bloom-muted" title={entry.note || ''}>{entry.note || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
