import { useEffect, useRef, useState } from 'react'
import {
  getBreathingTrack,
  readSavedBreathingTrack,
  saveBreathingTrack,
} from '../lib/breathingTracks'

export default function useBreathingAudio() {
  const [trackId, setTrackId] = useState(readSavedBreathingTrack)
  const trackIdRef = useRef(trackId)
  const audioRef = useRef(null)

  function audioElement() {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.loop = true
      audio.preload = 'auto'
      audioRef.current = audio
    }
    return audioRef.current
  }

  function loadTrack(id, fromStart) {
    const audio = audioElement()
    const track = getBreathingTrack(id)
    if (!track.src) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      return audio
    }
    const nextSrc = new URL(track.src, window.location.origin).href
    if (audio.src !== nextSrc) {
      audio.src = track.src
      audio.currentTime = 0
    } else if (fromStart) {
      audio.currentTime = 0
    }
    audio.loop = true
    audio.volume = 1
    return audio
  }

  function duck(active) {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = active ? 0.35 : 1
  }

  function selectTrack(id, { playing }) {
    if (!getBreathingTrack(id)) return
    trackIdRef.current = id
    setTrackId(id)
    saveBreathingTrack(id)
    const audio = loadTrack(id, true)
    if (playing && getBreathingTrack(id).src) {
      audio.play().catch(() => {})
      return
    }
    audio.pause()
  }

  function play({ fromStart = false } = {}) {
    const track = getBreathingTrack(trackIdRef.current)
    if (!track.src) return
    const audio = loadTrack(track.id, fromStart)
    audio.play().catch(() => {})
  }

  function pause() {
    audioRef.current?.pause()
  }

  function stop() {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    if (audio.src) audio.currentTime = 0
  }

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (!audio) return
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [])

  return { trackId, selectTrack, play, pause, stop, duck }
}
