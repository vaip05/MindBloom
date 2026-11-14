import { describe, expect, it } from 'vitest'
import {
  BREATHING_EXERCISES,
  PHASE_LABELS,
  describePattern,
  formatDuration,
  getDurationSeconds,
  getExerciseById,
} from './breathingExercises'

describe('breathing exercise data', () => {
  it.each(BREATHING_EXERCISES.map((exercise) => [exercise.name, exercise]))(
    '%s can be run by the timer and shown on the selection screen',
    (_exerciseName, exercise) => {
      expect(exercise.instructions.length).toBeGreaterThan(0)
      expect(exercise.recommendedCycles).toBeGreaterThan(0)
      expect(exercise.phases.length).toBeGreaterThan(0)
      for (const phase of exercise.phases) {
        expect(PHASE_LABELS[phase.type]).toBeDefined()
        expect(phase.seconds).toBeGreaterThan(0)
      }
    },
  )

  // Suggestions and saved session history refer to exercises by these ids.
  it.each(['box', '4-7-8', 'coherent'])('keeps the %s id', (exerciseId) => {
    expect(getExerciseById(exerciseId)).toBeDefined()
  })

  it.each([
    ['box', 64],
    ['4-7-8', 76],
    ['coherent', 60],
  ])('derives the %s duration from phases and cycles', (exerciseId, expectedSeconds) => {
    expect(getDurationSeconds(getExerciseById(exerciseId))).toBe(expectedSeconds)
  })

  it('describes the phase pattern', () => {
    expect(describePattern(getExerciseById('4-7-8'))).toBe('In 4 · Hold 7 · Out 8')
  })
})

describe('formatDuration', () => {
  it.each([
    [45, '45 sec'],
    [60, '1 min'],
    [64, '1 min 4 sec'],
    [120, '2 min'],
  ])('formats %i seconds', (totalSeconds, expectedText) => {
    expect(formatDuration(totalSeconds)).toBe(expectedText)
  })
})
