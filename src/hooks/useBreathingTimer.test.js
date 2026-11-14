import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useBreathingTimer, { getTimerPosition } from './useBreathingTimer'

const BOX_PHASES = [
  { type: 'inhale', seconds: 4 },
  { type: 'hold', seconds: 4 },
  { type: 'exhale', seconds: 4 },
  { type: 'hold', seconds: 4 },
]
const BOX_CYCLES = 4
const TICK_INTERVAL_MS = 200

describe('getTimerPosition', () => {
  it.each([
    { elapsedMs: 0, phaseIndex: 0, cycle: 1, secondsLeft: 4, totalSecondsLeft: 64 },
    { elapsedMs: 3999, phaseIndex: 0, cycle: 1, secondsLeft: 1, totalSecondsLeft: 61 },
    { elapsedMs: 4000, phaseIndex: 1, cycle: 1, secondsLeft: 4, totalSecondsLeft: 60 },
    { elapsedMs: 15999, phaseIndex: 3, cycle: 1, secondsLeft: 1, totalSecondsLeft: 49 },
    { elapsedMs: 16000, phaseIndex: 0, cycle: 2, secondsLeft: 4, totalSecondsLeft: 48 },
    { elapsedMs: 63999, phaseIndex: 3, cycle: 4, secondsLeft: 1, totalSecondsLeft: 1 },
    { elapsedMs: 64000, phaseIndex: 3, cycle: 4, secondsLeft: 0, totalSecondsLeft: 0 },
    { elapsedMs: 99999, phaseIndex: 3, cycle: 4, secondsLeft: 0, totalSecondsLeft: 0 },
  ])('maps $elapsedMs ms onto the session', ({ elapsedMs, ...expectedPosition }) => {
    expect(getTimerPosition(BOX_PHASES, BOX_CYCLES, elapsedMs)).toEqual(expectedPosition)
  })

  it('handles exercises with no hold phase', () => {
    const coherentPhases = [
      { type: 'inhale', seconds: 5 },
      { type: 'exhale', seconds: 5 },
    ]
    expect(getTimerPosition(coherentPhases, 6, 5000).phaseIndex).toBe(1)
  })
})

describe('useBreathingTimer', () => {
  let fakeClockMs

  // The clock moves separately from the interval so a test can deliver one late
  // tick, the way a browser throttles timers in a background tab.
  function advanceClockThenTick(elapsedMs) {
    fakeClockMs += elapsedMs
    act(() => vi.advanceTimersByTime(TICK_INTERVAL_MS))
  }

  beforeEach(() => {
    fakeClockMs = 1000
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    vi.spyOn(performance, 'now').mockImplementation(() => fakeClockMs)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  function renderBoxTimer(onComplete = vi.fn()) {
    return renderHook(() => useBreathingTimer(BOX_PHASES, BOX_CYCLES, onComplete))
  }

  it('waits idle on the first phase until started', () => {
    const { result } = renderBoxTimer()

    expect(result.current.status).toBe('idle')
    expect(result.current.phase.type).toBe('inhale')
    expect(result.current.totalSecondsLeft).toBe(64)
  })

  it('moves through inhale, hold, and exhale', () => {
    const { result } = renderBoxTimer()
    act(() => result.current.start())

    advanceClockThenTick(4000)
    expect(result.current.phase.type).toBe('hold')

    advanceClockThenTick(4000)
    expect(result.current.phase.type).toBe('exhale')
  })

  it('stays accurate when a background tab delays the ticks', () => {
    const { result } = renderBoxTimer()
    act(() => result.current.start())

    advanceClockThenTick(20000)

    expect(result.current.cycle).toBe(2)
    expect(result.current.phase.type).toBe('hold')
    expect(result.current.totalSecondsLeft).toBe(44)
  })

  it('does not count time spent paused', () => {
    const { result } = renderBoxTimer()
    act(() => result.current.start())
    advanceClockThenTick(2000)

    act(() => result.current.pause())
    const secondsLeftWhenPaused = result.current.totalSecondsLeft
    advanceClockThenTick(30000)
    expect(result.current.status).toBe('paused')
    expect(result.current.totalSecondsLeft).toBe(secondsLeftWhenPaused)

    act(() => result.current.start())
    expect(result.current.status).toBe('running')
    advanceClockThenTick(1000)
    expect(result.current.totalSecondsLeft).toBe(secondsLeftWhenPaused - 1)
  })

  it('reports completion exactly once', () => {
    const onComplete = vi.fn()
    const { result } = renderBoxTimer(onComplete)
    act(() => result.current.start())

    advanceClockThenTick(64000)
    advanceClockThenTick(5000)

    expect(result.current.status).toBe('complete')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('returns to the beginning on reset', () => {
    const { result } = renderBoxTimer()
    act(() => result.current.start())
    advanceClockThenTick(20000)

    act(() => result.current.reset())

    expect(result.current.status).toBe('idle')
    expect(result.current.totalSecondsLeft).toBe(64)
  })

  it('starts a new session from zero after completing', () => {
    const { result } = renderBoxTimer()
    act(() => result.current.start())
    advanceClockThenTick(64000)

    act(() => result.current.start())

    expect(result.current.status).toBe('running')
    expect(result.current.totalSecondsLeft).toBe(64)
  })

  it('stops its timer when leaving the page mid-session', () => {
    const { result, unmount } = renderBoxTimer()
    act(() => result.current.start())
    expect(vi.getTimerCount()).toBe(1)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
