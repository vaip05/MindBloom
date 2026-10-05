import { useState } from 'react'
import MoodSelector from '../components/MoodSelector'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useAuth } from '../context/AuthContext'
import { getMoodById, MOODS, STRESS_LEVELS } from '../lib/constants'
import { saveMoodEntry, saveStressEntry } from '../services/firestoreServices'

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
      setError('Please sign in before logging a check-in.')
      return
    }

    if (!selectedMood) {
      setError('Please choose how you are feeling today.')
      return
    }

    if (!stressLevel || stressLevel < 1 || stressLevel > 5) {
      setError('Please select a stress level from 1 to 5.')
      return
    }

    setIsSaving(true)

    try {
      const trimmedNote = note.trim()
      await Promise.all([
        saveMoodEntry(user.uid, {
          moodId: selectedMood,
          moodValue: selectedMoodMeta?.value ?? 0,
          note: trimmedNote,
        }),
        saveStressEntry(user.uid, {
          stressLevel: Number(stressLevel),
          note: trimmedNote,
        }),
      ])

      setSuccess('Your mood and stress check-in was saved successfully.')
      setNote('')
      setSelectedMood('')
      setStressLevel(3)
    } catch (submitError) {
      setError(submitError?.message || 'Something went wrong while saving your check-in.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-bloom-lavender">Daily check-in</p>
        <h1 className="text-3xl font-black text-bloom-navy">Mood & Stress Tracker</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-bloom-navy">How are you feeling?</h2>
            <p className="mt-1 text-sm text-bloom-muted">Pick the mood that best matches today.</p>
          </div>

          <MoodSelector value={selectedMood} onChange={setSelectedMood} />
        </Card>

        <Card className="border border-bloom-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-bloom-navy">Stress level</h2>
              <p className="mt-1 text-sm text-bloom-muted">Rate your stress from 1 to 5.</p>
            </div>
            <span className="rounded-full bg-bloom-blue-soft px-3 py-1 text-sm font-bold text-bloom-navy">
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
            placeholder="Add a quick note about what is affecting your day..."
            className="w-full resize-none rounded-2xl border border-bloom-border bg-bloom-bg px-4 py-3 text-bloom-navy outline-none transition focus:border-bloom-lavender focus:ring-2 focus:ring-bloom-lavender/20"
          />
          <div className="mt-2 text-right text-xs font-semibold text-bloom-muted">{note.length}/240</div>
        </Card>

        <ErrorMessage message={error} />
        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-bloom-muted">
            {selectedMoodMeta ? (
              <span>
                Selected mood: <strong className="text-bloom-navy">{selectedMoodMeta.emoji} {selectedMoodMeta.label}</strong>
              </span>
            ) : (
              <span>Choose a mood to continue</span>
            )}
          </div>

          <Button type="submit" disabled={isSaving} className="sm:min-w-[180px]">
            {isSaving ? 'Saving...' : 'Save check-in'}
          </Button>
        </div>
      </form>

      {selectedMoodMeta ? (
        <Card className="border border-bloom-border bg-gradient-to-br from-bloom-pink-soft via-white to-bloom-blue-soft p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bloom-lavender">Current mood</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">{selectedMoodMeta.emoji}</span>
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
