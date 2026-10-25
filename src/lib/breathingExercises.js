/**
 * Breathing exercises are static content, not Firestore data.
 * Each exercise lists its phases in order; one pass through them is a cycle.
 * Duration is derived from phases × recommendedCycles so it never drifts out of sync.
 */
export const BREATHING_EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'In 4, hold 4, out 4, hold 4. Four cycles.',
    instructions: [
      'Sit upright.',
      'In and out through your nose.',
      'Follow the circle: in, hold, out, hold.',
    ],
    phases: [
      { type: 'inhale', seconds: 4 },
      { type: 'hold', seconds: 4 },
      { type: 'exhale', seconds: 4 },
      { type: 'hold', seconds: 4 },
    ],
    recommendedCycles: 4,
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'In 4, hold 7, out 8. Four cycles.',
    instructions: [
      'Sit or lie down.',
      'In through your nose.',
      'Hold, then out slowly through your mouth.',
    ],
    phases: [
      { type: 'inhale', seconds: 4 },
      { type: 'hold', seconds: 7 },
      { type: 'exhale', seconds: 8 },
    ],
    recommendedCycles: 4,
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    description: 'In 5, out 5. Six cycles. No holds.',
    instructions: [
      'Sit comfortably.',
      'Use your nose if you can.',
      'Keep the in-breath and out-breath the same length.',
    ],
    phases: [
      { type: 'inhale', seconds: 5 },
      { type: 'exhale', seconds: 5 },
    ],
    recommendedCycles: 6,
  },
]

export const PHASE_LABELS = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
}

const PHASE_SHORT_LABELS = {
  inhale: 'In',
  hold: 'Hold',
  exhale: 'Out',
}

export function getExerciseById(id) {
  return BREATHING_EXERCISES.find((exercise) => exercise.id === id)
}

export function getCycleSeconds(exercise) {
  return exercise.phases.reduce((sum, phase) => sum + phase.seconds, 0)
}

export function getDurationSeconds(exercise) {
  return getCycleSeconds(exercise) * exercise.recommendedCycles
}

// "In 4 · Hold 7 · Out 8"
export function describePattern(exercise) {
  return exercise.phases
    .map((phase) => `${PHASE_SHORT_LABELS[phase.type]} ${phase.seconds}`)
    .join(' · ')
}

// 64 -> "1 min 4 sec", 60 -> "1 min"
export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds} sec`
  if (seconds === 0) return `${minutes} min`
  return `${minutes} min ${seconds} sec`
}
