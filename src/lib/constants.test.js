import { describe, expect, it } from 'vitest'
import { formatAuthError } from './constants'

describe('formatAuthError', () => {
  it('replaces Firebase codes with readable messages', () => {
    expect(formatAuthError({ code: 'auth/invalid-credential' })).toBe(
      'Invalid email or password. Please try again.',
    )
  })

  it('falls back to the message of an unknown error', () => {
    expect(formatAuthError({ code: 'auth/unknown', message: 'Unknown failure' })).toBe(
      'Unknown failure',
    )
  })

  it('still gives a message when the error has no details', () => {
    expect(formatAuthError(undefined)).toBe('Something went wrong. Please try again.')
  })
})
