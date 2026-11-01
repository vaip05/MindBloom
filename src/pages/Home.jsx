import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import MoodChart, { buildWeeklyMoodData } from '../components/MoodChart'
import StressChart, { buildWeeklyStressData } from '../components/StressChart'
import SunriseIllustration from '../components/SunriseIllustration'
import { FlowerMark } from '../components/BrandLogo'
import { useAuth } from '../context/AuthContext'
import MoodFace from '../components/MoodFace'
import { MOODS, STRESS_LEVELS, getGreeting } from '../lib/constants'
import { getRecentMoodEntries } from '../services/firestoreServices'

function entryDate(entry) {
  const value = entry.createdAt?.toDate?.() || entry.createdAt || entry.localDate
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const QUOTES = [
  'One check-in is enough for today.',
  'You can begin again with the next breath.',
  'Small care still counts.',
  'A quiet minute can change the tone of the day.',
  'You do not have to feel better to be gentle with yourself.',
  'Notice what is here, then take one small step.',
  'Rest is part of getting through the day.',
  'Your pace is allowed to be slow.',
  'This feeling can sit beside you without running the day.',
  'You already did something kind by showing up.',
  'Let the next breath be a little softer.',
  'Progress can look like logging one honest mood.',
  'You can put one thing down for now.',
  'Steady is more useful than perfect.',
  'Tomorrow can be different, and today can still be okay.',
]

function isSameDay(date, other) {
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  )
}

function isToday(date) {
  return isSameDay(date, new Date())
}

function isYesterday(date) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(date, yesterday)
}

export default function Home() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    let active = true

    async function loadWeek() {
      if (!user) {
        setEntries([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const history = await getRecentMoodEntries(user.uid, 7)
        if (active) setEntries(history)
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Unable to load this week.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadWeek()
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return undefined
    const timer = window.setInterval(() => {
      setQuoteIndex((index) => (index + 1) % QUOTES.length)
    }, 8000)
    return () => window.clearInterval(timer)
  }, [])

  const moodData = useMemo(() => buildWeeklyMoodData(entries), [entries])
  const stressData = useMemo(() => buildWeeklyStressData(entries), [entries])
  const todayEntry = useMemo(
    () => [...entries].reverse().find((entry) => {
      const date = entryDate(entry)
      return date && isToday(date)
    }),
    [entries],
  )
  const yesterdayEntry = useMemo(
    () => [...entries].reverse().find((entry) => {
      const date = entryDate(entry)
      return date && isYesterday(date)
    }),
    [entries],
  )
  const todayMood = MOODS.find((mood) => mood.id === todayEntry?.moodId)
  const todayStress = STRESS_LEVELS.find((level) => level.value === Number(todayEntry?.stressLevel))
  const yesterdayMood = MOODS.find((mood) => mood.id === yesterdayEntry?.moodId)
  const yesterdayStress = STRESS_LEVELS.find((level) => level.value === Number(yesterdayEntry?.stressLevel))
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-bloom-navy sm:text-4xl">{getGreeting()}</h1>
          <p className="mt-2 max-w-xl text-bloom-navy/80">
            Log a mood, or run a one-minute breathing exercise.
          </p>
        </div>
        <SunriseIllustration className="w-36 self-end sm:w-48" />
      </header>

      <Card className="bg-bloom-pink-soft px-5 py-6 sm:px-7">
        <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
          Daily check-in
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">Today&apos;s mood</h2>
        {loading ? (
          <p className="mt-4 text-sm text-bloom-navy/75">Loading today’s mood…</p>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {todayMood ? (
                <div className="flex items-center gap-4 rounded-md bg-white px-5 py-4">
                  <MoodFace mood={todayMood} className="h-16 w-16" />
                  <div>
                    <p className="text-2xl font-extrabold text-bloom-navy">{todayMood.label}</p>
                    <p className="mt-1 text-bloom-navy/75">
                      Stress {todayStress ? `${todayStress.value} · ${todayStress.label}` : 'not logged'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="self-center text-bloom-navy/75">No mood logged today.</p>
              )}
              <div className="rounded-md bg-white px-5 py-4">
                <p className="text-xs font-bold tracking-[0.16em] text-bloom-navy uppercase">Yesterday</p>
                {yesterdayMood ? (
                  <p className="mt-2 flex items-center gap-2 font-extrabold text-bloom-navy">
                    <MoodFace mood={yesterdayMood} className="h-6 w-6" />
                    <span>
                      {yesterdayMood.label}
                      {yesterdayStress ? ` · Stress ${yesterdayStress.value}` : ''}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 font-extrabold text-bloom-navy">No check-in</p>
                )}
                <p className="mt-3 text-sm text-bloom-navy/80" aria-live="polite">
                  {QUOTES[quoteIndex]}
                </p>
              </div>
            </div>
            <Link to="/mood" className="mt-4 block">
              <Button className="w-full">{todayMood ? 'Update mood' : 'Log mood'}</Button>
            </Link>
          </>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border border-bloom-border bg-white px-5 py-6 sm:px-6 lg:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-bloom-navy">This week</h2>
              <p className="mt-1 text-sm text-bloom-muted">
                Mood and stress for the last seven days.
              </p>
            </div>
            <Link to="/progress" className="text-sm font-bold text-bloom-lavender hover:underline">
              Full history
            </Link>
          </div>
          {loading ? (
            <p className="mt-8 text-sm text-bloom-muted">Loading this week…</p>
          ) : (
            <div className="mt-4 space-y-6">
              <ErrorMessage message={error} />
              <div>
                <h3 className="text-sm font-bold text-bloom-navy">Mood</h3>
                <MoodChart data={moodData} height={200} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-bloom-navy">Stress</h3>
                <StressChart data={stressData} height={200} />
              </div>
            </div>
          )}
        </Card>

        <Card className="flex flex-col bg-bloom-blue-soft px-5 py-6 sm:px-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
              Breath
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">One minute</h2>
          <p className="mt-1 text-bloom-navy/75">
            Box, 4-7-8, or coherent. Finished sessions stay in the log.
          </p>
          <div className="my-8 flex flex-1 items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-md bg-white/80">
              <FlowerMark className="h-16 w-16" />
            </div>
          </div>
          <Link to="/breathe">
            <Button className="w-full">
              Navigate to Breathing Exercise
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
