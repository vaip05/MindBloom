import { useState } from 'react'
import MoodFace from '../components/MoodFace'
import MoodSelector from '../components/MoodSelector'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useAuth } from '../context/AuthContext'
import { getMoodById, STRESS_LEVELS } from '../lib/constants'
import { saveMoodEntry } from '../services/firestoreServices'

export default function MoodStress() {
  const { user } = useAuth()
  const [selectedMood, setSelectedMood] = useState('')
  const [stressLevel, setStressLevel] = useState(3)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const selectedMoodMeta = getMoodById(selectedMood)
  const currentStressLabel = STRESS_LEVELS.find((level) => level.value === stressLevel)?.label || 'Moderate'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      setError('Sign in before saving a check-in.')
      return
    }

    if (!selectedMood) {
      setError('Choose a mood first.')
      return
    }

    if (!stressLevel || stressLevel < 1 || stressLevel > 5) {
      setError('Set stress from 1 to 5.')
      return
    }

    setIsSaving(true)

    try {
      const trimmedNote = note.trim()
      await saveMoodEntry(user.uid, {
        moodId: selectedMood,
        moodValue: selectedMoodMeta?.value ?? 0,
        stressLevel: Number(stressLevel),
        note: trimmedNote,
      })

      setSuccess('Check-in saved.')
      setNote('')
      setSelectedMood('')
      setStressLevel(3)
    } catch (submitError) {
      setError(submitError?.message || 'Could not save this check-in.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-bloom-lavender">Check-in</p>
        <h1 className="text-3xl font-black text-bloom-navy">Mood and stress</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-bloom-navy">Mood</h2>
            <p className="mt-1 text-sm text-bloom-muted">Choose one of the five.</p>
          </div>

          <MoodSelector value={selectedMood} onChange={setSelectedMood} />
        </Card>

        <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-bloom-navy">Stress</h2>
              <p className="mt-1 text-sm text-bloom-muted">1 is low. 5 is high.</p>
            </div>
            <span className="rounded-md bg-bloom-blue-soft px-3 py-1 text-sm font-bold text-bloom-navy">
              {currentStressLabel}
            </span>
          </div>

          <div className="mt-6">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={stressLevel}
              onChange={(event) => setStressLevel(Number(event.target.value))}
              aria-label="Stress level"
              className="h-2 w-full cursor-pointer accent-bloom-lavender"
            />

            <div className="mt-3 flex justify-between text-xs font-semibold text-bloom-muted">
              {STRESS_LEVELS.map((level) => (
                <span key={level.value}>{level.label}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
          <label htmlFor="checkin-note" className="mb-2 block text-lg font-extrabold text-bloom-navy">
            Note (optional)
          </label>
          <textarea
            id="checkin-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={240}
            placeholder="Optional. What is going on."
            className="w-full resize-none rounded-md border border-bloom-border bg-bloom-bg px-4 py-3 text-bloom-navy outline-none transition focus:border-bloom-lavender focus:ring-2 focus:ring-bloom-lavender/20"
          />
          <div className="mt-2 text-right text-xs font-semibold text-bloom-muted">{note.length}/240</div>
        </Card>

        <ErrorMessage message={error} />
        {success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-bloom-muted">
            {selectedMoodMeta ? (
              <span>
                Selected mood:{' '}
                <strong className="inline-flex items-center gap-1 text-bloom-navy">
                  <MoodFace mood={selectedMoodMeta} className="h-5 w-5" />
                  {selectedMoodMeta.label}
                </strong>
              </span>
            ) : (
              <span>Choose a mood before saving.</span>
            )}
          </div>

          <Button type="submit" disabled={isSaving} className="sm:min-w-[180px]">
            {isSaving ? 'Saving...' : 'Save check-in'}
          </Button>
        </div>
      </form>

      {selectedMoodMeta ? (
        <Card
          className="border border-bloom-border p-5 shadow-sm"
          style={{ backgroundColor: selectedMoodMeta.soft }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bloom-lavender">Selected</p>
          <div className="mt-3 flex items-center gap-3">
            <MoodFace mood={selectedMoodMeta} className="h-14 w-14" />
            <div>
              <p className="text-xl font-extrabold text-bloom-navy">{selectedMoodMeta.label}</p>
              <p className="text-sm text-bloom-muted">Stress: {currentStressLabel}</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
