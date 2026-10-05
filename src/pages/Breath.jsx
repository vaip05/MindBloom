import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import BreathingExercise from '../components/BreathingExercise'
import { FlowerMark } from '../components/BrandLogo'
import {
  BREATHING_EXERCISES,
  describePattern,
  formatDuration,
  getDurationSeconds,
  getExerciseById,
} from '../lib/breathingExercises'

export default function Breath() {
  const [selectedId, setSelectedId] = useState(BREATHING_EXERCISES[0].id)
  // 'choose' → 'session' → 'complete'
  const [view, setView] = useState('choose')
  const [lastSession, setLastSession] = useState(null)

  const selected = getExerciseById(selectedId)

  function handleComplete(session) {
    // Sprint 2: save `session` to Firestore here (see saveBreathingSession).
    setLastSession(session)
    setView('complete')
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-bloom-lavender uppercase">
          Breath
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-bloom-navy">Take a breath</h1>
        <p className="mt-2 max-w-2xl text-bloom-navy/80">
          Choose a short guided exercise and follow the circle.
        </p>
      </header>

      {view === 'choose' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {BREATHING_EXERCISES.map((exercise) => {
              const isSelected = exercise.id === selectedId
              return (
                <button
                  key={exercise.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(exercise.id)}
                  className={`rounded-[1.75rem] border-2 bg-white px-5 py-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-lavender ${
                    isSelected
                      ? 'border-bloom-lavender'
                      : 'border-bloom-border hover:border-bloom-lavender/50'
                  }`}
                >
                  <h2 className="text-lg font-extrabold text-bloom-navy">{exercise.name}</h2>
                  <p className="mt-1 text-sm text-bloom-navy/75">{exercise.description}</p>
                  <p className="mt-3 text-xs font-bold tracking-[0.12em] text-bloom-lavender uppercase">
                    {formatDuration(getDurationSeconds(exercise))}
                  </p>
                </button>
              )
            })}
          </div>

          <Card className="bg-bloom-blue-soft px-5 py-6 sm:px-7">
            <p className="text-xs font-bold tracking-[0.18em] text-bloom-navy uppercase">
              {describePattern(selected)}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">{selected.name}</h2>
            <p className="mt-1 text-bloom-navy/75">
              Recommended: {selected.recommendedCycles} cycles ·{' '}
              {formatDuration(getDurationSeconds(selected))}
            </p>

            <h3 className="mt-5 text-sm font-bold text-bloom-navy">How to do it</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-bloom-navy/80">
              {selected.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <p className="mt-5 text-sm text-bloom-muted">
              Stop and breathe normally if you feel dizzy or uncomfortable.
            </p>

            <Button className="mt-6 w-full sm:w-auto sm:min-w-48" onClick={() => setView('session')}>
              Start {selected.name} →
            </Button>
          </Card>
        </>
      ) : null}

      {view === 'session' ? (
        <Card className="bg-bloom-blue-soft px-5 py-6 sm:px-7">
          <h2 className="text-center text-xl font-extrabold text-bloom-navy">{selected.name}</h2>
          <BreathingExercise
            key={selected.id}
            exercise={selected}
            onComplete={handleComplete}
            onExit={() => setView('choose')}
          />
        </Card>
      ) : null}

      {view === 'complete' && lastSession ? (
        <Card className="flex flex-col items-center bg-bloom-green-soft px-5 py-10 text-center sm:px-7">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80">
            <FlowerMark className="h-16 w-16" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-bloom-navy">Session complete</h2>
          <p className="mt-2 text-bloom-navy/75">
            You finished {selected.name}: {lastSession.cyclesCompleted} cycles in{' '}
            {formatDuration(lastSession.durationSeconds)}. Nice work.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setView('session')} className="min-w-48">
              Breathe again
            </Button>
            <Button variant="secondary" onClick={() => setView('choose')} className="min-w-48">
              Choose another
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
