import { act, renderHook, waitFor } from '@testing-library/react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureUserProfile } from '../services/firestoreServices'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))
vi.mock('../lib/firebase', () => ({ auth: { name: 'fake-auth' }, isFirebaseConfigured: true }))
vi.mock('../services/firestoreServices', () => ({ ensureUserProfile: vi.fn() }))

const FAKE_USER = { uid: 'user-1', email: 'bloom@example.com' }

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider })
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    onAuthStateChanged.mockImplementation((_auth, notifyAuthChanged) => {
      notifyAuthChanged(FAKE_USER)
      return vi.fn()
    })
  })

  it('exposes the signed-in user once Firebase reports it', async () => {
    const { result } = renderAuth()

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toEqual(FAKE_USER)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('stops listening to Firebase on unmount', () => {
    const stopListening = vi.fn()
    onAuthStateChanged.mockReturnValue(stopListening)

    renderAuth().unmount()

    expect(stopListening).toHaveBeenCalledTimes(1)
  })

  it('trims the email on login and makes sure a profile exists', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: FAKE_USER })
    const { result } = renderAuth()

    await act(() => result.current.login({ email: '  bloom@example.com ', password: 'secret1' }))

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'bloom@example.com',
      'secret1',
    )
    expect(ensureUserProfile).toHaveBeenCalledWith(FAKE_USER)
  })

  it('turns a failed login into a readable error', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' })
    const { result } = renderAuth()

    await expect(
      result.current.login({ email: 'bloom@example.com', password: 'wrong-password' }),
    ).rejects.toThrow('Invalid email or password. Please try again.')
  })

  it('registers a user with a trimmed name and creates their profile', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: FAKE_USER })
    const { result } = renderAuth()

    await act(() =>
      result.current.register({
        name: ' Bloom ',
        email: 'bloom@example.com',
        password: 'secret1',
      }),
    )

    expect(updateProfile).toHaveBeenCalledWith(FAKE_USER, { displayName: 'Bloom' })
    expect(ensureUserProfile).toHaveBeenCalledWith(FAKE_USER, { displayName: 'Bloom' })
  })

  it('reports an email that is already registered', async () => {
    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' })
    const { result } = renderAuth()

    await expect(
      result.current.register({ name: 'Bloom', email: 'bloom@example.com', password: 'secret1' }),
    ).rejects.toThrow('An account with this email already exists.')
  })

  it('signs out through Firebase', async () => {
    const { result } = renderAuth()

    await act(() => result.current.logout())

    expect(signOut).toHaveBeenCalledTimes(1)
  })
})

describe('useAuth', () => {
  it('fails loudly when used outside AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider')
  })
})
