import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { getMoodById, STRESS_LEVELS } from '../lib/constants'
import {
  getLatestMood,
  getLatestStress,
  getSuggestions,
  refreshSuggestions,
} from '../services/firestoreServices'

export default function Suggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [latestMood, setLatestMood] = useState(null)
  const [latestStress, setLatestStress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [saved, mood, stress] = await Promise.all([
          getSuggestions(user.uid),
          getLatestMood(user.uid),
          getLatestStress(user.uid),
        ])
        if (!active) return
        setSuggestions(saved)
        setLatestMood(mood)
        setLatestStress(stress)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user.uid])

  // Re-runs the rules, e.g. after a new check-in or later in the day.
  async function handleRefresh() {
    setError('')
    setRefreshing(true)
    try {
      setSuggestions(await refreshSuggestions(user.uid))
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  const mood = getMoodById(latestMood?.moodId)
  const stressLabel = STRESS_LEVELS.find(
    (level) => level.value === latestStress?.stressLevel,
  )?.label

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-bloom-lavender uppercase">
          Wellness
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-bloom-navy">Suggestions for you</h1>
        <p className="mt-2 max-w-2xl text-bloom-navy/80">
          Small ideas based on your recent mood, stress, and breathing.
        </p>
      </header>

      {loading ? (
        <LoadingSpinner label="Finding suggestions…" />
      ) : (
        <>
          <Card className="flex flex-col gap-4 bg-bloom-peach-soft px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
                Based on
              </p>
              {mood ? (
                <p className="mt-2 text-lg font-extrabold text-bloom-navy">
                  {mood.emoji} {mood.label}
                  {stressLabel ? ` · ${stressLabel} stress` : ''}
                </p>
              ) : (
                <>
                  <p className="mt-2 text-lg font-extrabold text-bloom-navy">No check-ins yet</p>
                  <p className="mt-1 text-sm text-bloom-navy/75">
                    These are starter tips. Log a mood to personalize them.
                  </p>
                </>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="sm:min-w-40"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </Card>

          <ErrorMessage message={error} />

          <div className="grid gap-4 sm:grid-cols-2">
            {suggestions.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col border border-bloom-border bg-white p-5 shadow-sm sm:p-6"
              >
                <span className="self-start rounded-full bg-bloom-peach-soft px-3 py-1 text-xs font-bold text-bloom-navy">
                  {item.tag}
                </span>
                <h2 className="mt-3 text-xl font-extrabold text-bloom-navy">{item.title}</h2>
                <p className="mt-1 flex-1 text-sm text-bloom-navy/75">{item.body}</p>
                {item.action ? (
                  <Link to={item.action.to} className="mt-5">
                    <Button variant="secondary" className="w-full">
                      {item.action.label} →
                    </Button>
                  </Link>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
