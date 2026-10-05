/**
 * Breathing exercises are static content, not Firestore data.
 * Each exercise lists its phases in order; one pass through them is a cycle.
 * Duration is derived from phases × recommendedCycles so it never drifts out of sync.
 */
export const BREATHING_EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Even four-count breathing to steady your mind and focus.',
    instructions: [
      'Sit upright and relax your shoulders.',
      'Breathe in and out through your nose.',
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
    description: 'A long, slow exhale to help you unwind, especially before sleep.',
    instructions: [
      'Sit or lie down comfortably.',
      'Breathe in quietly through your nose.',
      'Hold gently, then breathe out slowly through your mouth.',
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
    description: 'Slow, even breaths with no holds. A gentle place to start.',
    instructions: [
      'Sit comfortably and soften your jaw.',
      'Breathe through your nose if you can.',
      'Match the length of each breath in and out.',
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
