import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../src/context/AuthContext'

const mocks = vi.hoisted(() => ({
  mockAuth: { name: 'mock-auth' },
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  ensureUserProfile: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword:
    mocks.createUserWithEmailAndPassword,
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInWithEmailAndPassword:
    mocks.signInWithEmailAndPassword,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
}))

vi.mock('../src/lib/firebase', () => ({
  auth: mocks.mockAuth,
  isFirebaseConfigured: true,
}))

vi.mock('../src/services/firestoreServices', () => ({
  ensureUserProfile: mocks.ensureUserProfile,
}))

vi.mock('../src/lib/constants', () => ({
  formatAuthError: vi.fn(
    (error) => error.message || 'Authentication error',
  ),
}))

function AuthProbe() {
  const {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  } = useAuth()

  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="authenticated">
        {String(isAuthenticated)}
      </p>
      <p data-testid="user-id">{user?.uid || 'none'}</p>

      <button
        onClick={() =>
          login({
            email: '  user@example.com  ',
            password: 'password123',
          })
        }
      >
        Login
      </button>

      <button
        onClick={() =>
          register({
            name: '  Angelo  ',
            email: '  new@example.com  ',
            password: 'password123',
          })
        }
      >
        Register
      </button>

      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderAuthProbe() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  mocks.onAuthStateChanged.mockImplementation(
    (_auth, callback) => {
      callback(null)
      return vi.fn()
    },
  )

  mocks.ensureUserProfile.mockResolvedValue({})
  mocks.signOut.mockResolvedValue(undefined)
  mocks.updateProfile.mockResolvedValue(undefined)
})

describe('authentication', () => {
  it('loads with no authenticated user', async () => {
    renderAuthProbe()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent(
        'false',
      )
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent(
      'false',
    )

    expect(screen.getByTestId('user-id')).toHaveTextContent(
      'none',
    )
  })

  it('logs in with trimmed email credentials', async () => {
    const loggedInUser = {
      uid: 'user-123',
      email: 'user@example.com',
    }

    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: loggedInUser,
    })

    renderAuthProbe()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent(
        'false',
      )
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Login' }),
    )

    await waitFor(() => {
      expect(
        mocks.signInWithEmailAndPassword,
      ).toHaveBeenCalledWith(
        mocks.mockAuth,
        'user@example.com',
        'password123',
      )
    })

    expect(mocks.ensureUserProfile).toHaveBeenCalledWith(
      loggedInUser,
    )
  })

  it('registers a user and creates a profile', async () => {
    const registeredUser = {
      uid: 'new-user-123',
      email: 'new@example.com',
    }

    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: registeredUser,
    })

    renderAuthProbe()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent(
        'false',
      )
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    await waitFor(() => {
      expect(
        mocks.createUserWithEmailAndPassword,
      ).toHaveBeenCalledWith(
        mocks.mockAuth,
        'new@example.com',
        'password123',
      )
    })

    expect(mocks.updateProfile).toHaveBeenCalledWith(
      registeredUser,
      { displayName: 'Angelo' },
    )

    expect(mocks.ensureUserProfile).toHaveBeenCalledWith(
      registeredUser,
      { displayName: 'Angelo' },
    )
  })

  it('logs out the authenticated user', async () => {
    renderAuthProbe()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent(
        'false',
      )
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Logout' }),
    )

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalledWith(
        mocks.mockAuth,
      )
    })
  })
})