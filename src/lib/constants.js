export const MOODS = [
  {
    id: 'great',
    label: 'Great',
    value: 5,
    emoji: '😄',
    color: '#f9b4bc',
    soft: '#fde8eb',
  },
  {
    id: 'good',
    label: 'Good',
    value: 4,
    emoji: '🙂',
    color: '#ffd4b8',
    soft: '#ffe8d6',
  },
  {
    id: 'okay',
    label: 'Okay',
    value: 3,
    emoji: '😐',
    color: '#fde68a',
    soft: '#fef3c7',
  },
  {
    id: 'not-great',
    label: 'Not great',
    value: 2,
    emoji: '😕',
    color: '#a7f3d0',
    soft: '#d1fae5',
  },
  {
    id: 'tough',
    label: 'Tough',
    value: 1,
    emoji: '😔',
    color: '#bae6fd',
    soft: '#e0f2fe',
  },
]

export const STRESS_LEVELS = [
  { value: 1, label: 'Very low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very high' },
]

export const BREATHING_DURATION_SECONDS = 60

export const PROFILE_AVATARS = [
  '🌸',
  '🌼',
  '🌻',
  '🌿',
  '🍃',
  '🌊',
  '☀️',
  '🌙',
  '☁️',
  '🌈',
  '💜',
  '💙',
  '💚',
  '🙂',
  '😌',
  '😇',
  '🤗',
  '🧘',
  '🌱',
  '✨',
]

export const DEFAULT_AVATAR = '🌸'
export const BIO_MAX_LENGTH = 160

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/mood', label: 'Mood & Stress', icon: 'heart' },
  { to: '/breathe', label: 'Breath', icon: 'flower' },
  { to: '/reminders', label: 'Daily Reminders', icon: 'bell' },
  { to: '/suggestions', label: 'Wellness Suggestions', icon: 'sparkles' },
  { to: '/progress', label: 'Progress Charts', icon: 'chart' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 17) return 'Good afternoon!'
  return 'Good evening!'
}

export function getMoodById(id) {
  return MOODS.find((mood) => mood.id === id)
}

export function formatAuthError(error) {
  const code = error?.code || ''
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/missing-password': 'Please enter your password.',
  }
  return map[code] || error?.message || 'Something went wrong. Please try again.'
}
