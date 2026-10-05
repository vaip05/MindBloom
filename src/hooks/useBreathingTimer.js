import { useEffect, useRef, useState } from 'react'

// How often the screen refreshes. Accuracy comes from the clock, not from this.
const TICK_MS = 200

/**
 * Pure helper: given how long the session has run, work out where we are.
 * Keeping this separate from React makes the timing easy to reason about and test.
 */
export function getTimerPosition(phases, cycles, elapsedMs) {
  const cycleMs = phases.reduce((sum, phase) => sum + phase.seconds * 1000, 0)
  const totalMs = cycleMs * cycles

  if (elapsedMs >= totalMs) {
    return { phaseIndex: phases.length - 1, cycle: cycles, secondsLeft: 0, totalSecondsLeft: 0 }
  }

  let msIntoCycle = elapsedMs % cycleMs
  let phaseIndex = 0
  while (msIntoCycle >= phases[phaseIndex].seconds * 1000) {
    msIntoCycle -= phases[phaseIndex].seconds * 1000
    phaseIndex += 1
  }

  return {
    phaseIndex,
    cycle: Math.floor(elapsedMs / cycleMs) + 1,
    secondsLeft: Math.ceil((phases[phaseIndex].seconds * 1000 - msIntoCycle) / 1000),
    totalSecondsLeft: Math.ceil((totalMs - elapsedMs) / 1000),
  }
}

/**
 * Runs a breathing session over `phases` repeated `cycles` times.
 *
 * Time is measured with timestamps (performance.now) instead of counting
 * interval ticks, so the timer stays correct even when the browser delays
 * ticks in a background tab. Pausing "banks" the time run so far.
 *
 * status: 'idle' | 'running' | 'paused' | 'complete'
 */
export default function useBreathingTimer(phases, cycles, onComplete) {
  const [status, setStatus] = useState('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const bankedMsRef = useRef(0)
  const resumedAtRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const totalMs = phases.reduce((sum, phase) => sum + phase.seconds * 1000, 0) * cycles

  useEffect(() => {
    if (status !== 'running') return undefined

    const timer = window.setInterval(() => {
      const elapsed = bankedMsRef.current + (performance.now() - resumedAtRef.current)
      if (elapsed >= totalMs) {
        window.clearInterval(timer)
        setElapsedMs(totalMs)
        setStatus('complete')
        onCompleteRef.current?.()
        return
      }
      setElapsedMs(elapsed)
    }, TICK_MS)

    // Runs on pause, completion, or leaving the page mid-session.
    return () => window.clearInterval(timer)
  }, [status, totalMs])

  // Starts a new session, or resumes a paused one.
  function start() {
    if (status === 'running') return
    if (status !== 'paused') {
      bankedMsRef.current = 0
      setElapsedMs(0)
    }
    resumedAtRef.current = performance.now()
    setStatus('running')
  }

  function pause() {
    if (status !== 'running') return
    bankedMsRef.current += performance.now() - resumedAtRef.current
    setElapsedMs(bankedMsRef.current)
    setStatus('paused')
  }

  function reset() {
    bankedMsRef.current = 0
    setElapsedMs(0)
    setStatus('idle')
  }

  const position = getTimerPosition(phases, cycles, elapsedMs)

  return {
    status,
    phase: phases[position.phaseIndex],
    phaseIndex: position.phaseIndex,
    cycle: position.cycle,
    secondsLeft: position.secondsLeft,
    totalSecondsLeft: position.totalSecondsLeft,
    start,
    pause,
    reset,
  }
}
