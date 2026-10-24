const STORAGE_KEY = 'mindbloom-breathing-track'

export const BREATHING_TRACKS = [
  { id: 'off', name: 'Off', src: null },
  { id: 'lofi', name: 'Lofi', src: '/audio/lofi.mp3' },
  { id: 'fireplace', name: 'Fireplace', src: '/audio/fireplace.mp3' },
  { id: 'ocean', name: 'Ocean', src: '/audio/ocean.mp3' },
]

export function getBreathingTrack(id) {
  return BREATHING_TRACKS.find((track) => track.id === id) || BREATHING_TRACKS[0]
}

export function readSavedBreathingTrack() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (BREATHING_TRACKS.some((track) => track.id === saved)) return saved
  } catch {
    // Private browsing can block storage. Off is a fine default.
  }
  return 'off'
}

export function saveBreathingTrack(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // The choice still applies for this visit.
  }
}
