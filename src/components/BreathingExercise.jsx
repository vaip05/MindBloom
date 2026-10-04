import { useEffect, useRef, useState } from 'react'
import { FlowerMark } from './BrandLogo'
import Button from './ui/Button'
import { BREATHING_DURATION_SECONDS } from '../lib/constants'

const PHASES = [
  { id: 'inhale', label: 'Breathe in', seconds: 4 },
  { id: 'hold', label: 'Hold', seconds: 4 },
  { id: 'exhale', label: 'Breathe out', seconds: 4 },
]

export default function BreathingExercise({ onComplete }) {
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(BREATHING_DURATION_SECONDS)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseLeft, setPhaseLeft] = useState(PHASES[0].seconds)
  const completedRef = useRef(false)
  const phaseIndexRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!running) return undefined

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          if (!completedRef.current) {
            completedRef.current = true
            onCompleteRef.current?.({
              durationSeconds: BREATHING_DURATION_SECONDS,
              completed: true,
            })
          }
          return 0
        }
        return prev - 1
      })

      setPhaseLeft((prev) => {
        if (prev > 1) return prev - 1
        const nextIndex = (phaseIndexRef.current + 1) % PHASES.length
        phaseIndexRef.current = nextIndex
        setPhaseIndex(nextIndex)
        return PHASES[nextIndex].seconds
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running])

  function start() {
    completedRef.current = false
    phaseIndexRef.current = 0
    setSecondsLeft(BREATHING_DURATION_SECONDS)
    setPhaseIndex(0)
    setPhaseLeft(PHASES[0].seconds)
    setRunning(true)
  }

  function stop() {
    setRunning(false)
  }

  const phase = PHASES[phaseIndex]

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-white/70 ${
          running ? 'animate-breathe' : ''
        }`}
      >
        <FlowerMark className="h-20 w-20" />
      </div>

      <p className="text-sm font-bold tracking-[0.16em] text-bloom-navy/70 uppercase">
        {running ? phase.label : 'Ready when you are'}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-bloom-navy">
        {running ? `${phaseLeft}s` : '1 minute'}
      </p>
      <p className="mt-2 text-sm text-bloom-muted">
        {running
          ? `${secondsLeft}s remaining in this session`
          : 'Follow the circle as it gently expands and softens.'}
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        {!running ? (
          <Button onClick={start} className="min-w-48">
            Start breathing →
          </Button>
        ) : (
          <Button variant="secondary" onClick={stop} className="min-w-48">
            Pause
          </Button>
        )}
      </div>
    </div>
  )
}
