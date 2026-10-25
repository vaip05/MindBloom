import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'mindbloom-breathing-voice'

const CLIPS = {
  inhale: '/audio/voice/breathe-in.wav',
  hold: '/audio/voice/hold.wav',
  exhale: '/audio/voice/breathe-out.wav',
  4: '/audio/voice/four-cycles.wav',
  6: '/audio/voice/six-cycles.wav',
  last: '/audio/voice/last-cycle.wav',
  finished: '/audio/voice/finished.wav',
}

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

function writeEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // The choice still applies for this visit.
  }
}

export default function useBreathingVoice(duck) {
  const [enabled, setEnabled] = useState(readEnabled)
  const enabledRef = useRef(enabled)
  const spokenRef = useRef('')
  const finishingRef = useRef(false)
  const duckRef = useRef(duck)
  const queueRef = useRef([])
  const currentRef = useRef(null)

  useEffect(() => {
    duckRef.current = duck
  }, [duck])

  function stopPlayback() {
    queueRef.current = []
    const current = currentRef.current
    currentRef.current = null
    if (current) {
      current.onended = null
      current.pause()
    }
    duckRef.current?.(false)
  }

  function playNext() {
    const src = queueRef.current.shift()
    if (!src) {
      duckRef.current?.(false)
      return
    }
    const audio = new Audio(src)
    currentRef.current = audio
    audio.onended = () => {
      if (currentRef.current !== audio) return
      playNext()
    }
    audio.onerror = () => {
      if (currentRef.current !== audio) return
      playNext()
    }
    duckRef.current?.(true)
    audio.play().catch(() => {
      if (currentRef.current !== audio) return
      playNext()
    })
  }

  function playClips(ids) {
    stopPlayback()
    queueRef.current = ids.map((id) => CLIPS[id]).filter(Boolean)
    if (queueRef.current.length === 0) return
    playNext()
  }

  function announce({ phaseType, phaseIndex, cycle, totalCycles, opening }) {
    if (!enabledRef.current) return
    const key = `${cycle}-${phaseIndex}`
    spokenRef.current = key
    const cue = CLIPS[phaseType] ? phaseType : 'inhale'
    if (opening && CLIPS[totalCycles]) {
      playClips([totalCycles, cue])
      return
    }
    if (cycle === totalCycles && phaseIndex === 0) {
      playClips(['last', cue])
      return
    }
    playClips([cue])
  }

  function followPhase({ phaseType, phaseIndex, cycle, totalCycles, running }) {
    if (!enabledRef.current || !running) return
    const key = `${cycle}-${phaseIndex}`
    if (spokenRef.current === key) return
    announce({ phaseType, phaseIndex, cycle, totalCycles, opening: false })
  }

  function setGuide(next) {
    enabledRef.current = next
    setEnabled(next)
    writeEnabled(next)
    if (!next) {
      spokenRef.current = ''
      stopPlayback()
    }
  }

  function stop() {
    finishingRef.current = false
    spokenRef.current = ''
    stopPlayback()
  }

  function finish() {
    if (!enabledRef.current) return
    finishingRef.current = true
    playClips(['finished'])
  }

  useEffect(() => {
    return () => {
      if (finishingRef.current) return
      queueRef.current = []
      const current = currentRef.current
      currentRef.current = null
      if (current) {
        current.onended = null
        current.pause()
      }
    }
  }, [])

  return { enabled, setGuide, announce, followPhase, stop, finish }
}
