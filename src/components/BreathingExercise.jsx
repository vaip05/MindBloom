import { FlowerMark } from './BrandLogo'
import Button from './ui/Button'
import useBreathingTimer from '../hooks/useBreathingTimer'
import { PHASE_LABELS, formatDuration, getDurationSeconds } from '../lib/breathingExercises'

// A hold keeps the circle wherever the previous inhale/exhale left it.
function isExpanded(phases, index) {
  for (let step = 0; step < phases.length; step += 1) {
    const { type } = phases[(index - step + phases.length) % phases.length]
    if (type === 'inhale') return true
    if (type === 'exhale') return false
  }
  return false
}

export default function BreathingExercise({ exercise, onComplete, onExit }) {
  const { phases, recommendedCycles } = exercise
  const durationSeconds = getDurationSeconds(exercise)

  const { status, phase, phaseIndex, cycle, secondsLeft, totalSecondsLeft, start, pause } =
    useBreathingTimer(phases, recommendedCycles, () => {
      onComplete?.({
        exerciseType: exercise.id,
        durationSeconds,
        cyclesCompleted: recommendedCycles,
        completedAt: new Date(),
      })
    })

  const started = status === 'running' || status === 'paused'
  const expanded = started && isExpanded(phases, phaseIndex)

  return (
    <div className="flex flex-col items-center text-center">
      <div className="my-8 flex h-56 items-center justify-center">
        {/* Scales over the length of the current phase. Reduced motion: no scaling, text cues only. */}
        <div
          aria-hidden="true"
          className={`flex h-40 w-40 items-center justify-center rounded-full bg-white/70 transition-transform ease-in-out motion-reduce:scale-100 motion-reduce:transition-none ${
            expanded ? 'scale-135' : 'scale-100'
          }`}
          style={{ transitionDuration: `${phase.seconds}s` }}
        >
          <FlowerMark className="h-20 w-20" />
        </div>
      </div>

      <p
        aria-live="polite"
        className="text-sm font-bold tracking-[0.16em] text-bloom-navy/70 uppercase"
      >
        {status === 'idle' && 'Ready when you are'}
        {status === 'running' && PHASE_LABELS[phase.type]}
        {status === 'paused' && 'Paused'}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-bloom-navy">
        {started ? `${secondsLeft}s` : formatDuration(durationSeconds)}
      </p>
      <p className="mt-2 text-sm text-bloom-muted">
        {started
          ? `Cycle ${cycle} of ${recommendedCycles} · ${totalSecondsLeft}s left`
          : 'Follow the circle as it gently expands and softens.'}
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        {status === 'running' ? (
          <Button variant="secondary" onClick={pause} className="min-w-48">
            Pause
          </Button>
        ) : (
          <Button onClick={start} className="min-w-48">
            {status === 'paused' ? 'Resume' : 'Start breathing →'}
          </Button>
        )}
        <Button variant="ghost" onClick={onExit} className="min-w-48">
          {started ? 'End session' : '← Back to exercises'}
        </Button>
      </div>
    </div>
  )
}
