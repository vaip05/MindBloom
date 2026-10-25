import { useEffect } from 'react'
import { FlowerMark } from './BrandLogo'
import Button from './ui/Button'
import useBreathingAudio from '../hooks/useBreathingAudio'
import useBreathingTimer from '../hooks/useBreathingTimer'
import useBreathingVoice from '../hooks/useBreathingVoice'
import { PHASE_LABELS, formatDuration, getDurationSeconds } from '../lib/breathingExercises'
import { BREATHING_TRACKS } from '../lib/breathingTracks'

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

  const audio = useBreathingAudio()
  const voice = useBreathingVoice(audio.duck)
  const { status, phase, phaseIndex, cycle, secondsLeft, totalSecondsLeft, start, pause } =
    useBreathingTimer(phases, recommendedCycles, () => {
      voice.finish()
      onComplete?.({
        exerciseType: exercise.id,
        durationSeconds,
        cyclesCompleted: recommendedCycles,
        completedAt: new Date(),
      })
    })

  const started = status === 'running' || status === 'paused'
  const expanded = started && isExpanded(phases, phaseIndex)
  const audioOnly = voice.enabled && audio.trackId === 'off'

  useEffect(() => {
    voice.followPhase({
      phaseType: phase.type,
      phaseIndex,
      cycle,
      totalCycles: recommendedCycles,
      running: status === 'running',
    })
  }, [status, phase.type, phaseIndex, cycle, recommendedCycles, voice])

  function cueNow(opening) {
    voice.announce({
      phaseType: phase.type,
      phaseIndex,
      cycle,
      totalCycles: recommendedCycles,
      opening,
    })
  }

  function handleStart() {
    const resuming = status === 'paused'
    start()
    audio.play({ fromStart: !resuming })
    cueNow(!resuming)
  }

  function handlePause() {
    pause()
    audio.pause()
    voice.stop()
  }

  function handleExit() {
    audio.stop()
    voice.stop()
    onExit()
  }

  function handleVoiceGuide() {
    const next = !voice.enabled
    voice.setGuide(next)
    if (next && status === 'running') cueNow(false)
  }

  function handleAudioOnly() {
    if (audioOnly) {
      voice.setGuide(false)
      return
    }
    audio.selectTrack('off', { playing: status === 'running' })
    voice.setGuide(true)
    if (status === 'running') cueNow(false)
  }

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
        {status === 'idle' && 'Not started'}
        {status === 'running' && PHASE_LABELS[phase.type]}
        {status === 'paused' && 'Paused'}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-bloom-navy">
        {started ? `${secondsLeft}s` : formatDuration(durationSeconds)}
      </p>
      <p className="mt-2 text-sm text-bloom-muted">
        {started
          ? `Cycle ${cycle} of ${recommendedCycles} · ${totalSecondsLeft}s left`
          : 'The circle grows on the inhale and shrinks on the exhale.'}
      </p>

      <div className="mt-8" role="group" aria-label="Background music">
        <p className="text-sm font-bold text-bloom-navy">Background</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {BREATHING_TRACKS.map((track) => {
            const pressed = audio.trackId === track.id
            return (
              <button
                key={track.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => audio.selectTrack(track.id, { playing: status === 'running' })}
                className={`rounded-md px-4 py-2 text-sm font-bold ${
                  pressed
                    ? 'bg-bloom-lavender text-white'
                    : 'bg-white text-bloom-navy border border-bloom-border'
                }`}
              >
                {track.name}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-bloom-muted">
          Choose between Lofi, Ocean, or Fireplace background music.
        </p>
      </div>

      <div className="mt-6" role="group" aria-label="Voice guide">
        <p className="text-sm font-bold text-bloom-navy">Voice</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            aria-pressed={voice.enabled}
            onClick={handleVoiceGuide}
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              voice.enabled
                ? 'bg-bloom-lavender text-white'
                : 'bg-white text-bloom-navy border border-bloom-border'
            }`}
          >
            Voice guide
          </button>
          <button
            type="button"
            aria-pressed={audioOnly}
            onClick={handleAudioOnly}
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              audioOnly
                ? 'bg-bloom-lavender text-white'
                : 'bg-white text-bloom-navy border border-bloom-border'
            }`}
          >
            Audio only
          </button>
        </div>
        <p className="mt-2 text-xs text-bloom-muted">
          Voice guide plays a recorded voice over the background. Audio only is that voice with no music.
        </p>
        <p className="mt-1 text-xs text-bloom-muted">Voice by ElevenLabs.</p>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        {status === 'running' ? (
          <Button variant="secondary" onClick={handlePause} className="min-w-48">
            Pause
          </Button>
        ) : (
          <Button onClick={handleStart} className="min-w-48">
            {status === 'paused' ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button variant="ghost" onClick={handleExit} className="min-w-48">
          {started ? 'End session' : 'Back to exercises'}
        </Button>
      </div>
    </div>
  )
}
