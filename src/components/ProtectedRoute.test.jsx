import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

function renderProtectedPage(authState) {
  useAuth.mockReturnValue(authState)
  render(
    <MemoryRouter initialEntries={['/breathe']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/breathe"
          element={
            <ProtectedRoute>
              <p>Private page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows the page to a signed-in user', () => {
    renderProtectedPage({ user: { uid: 'user-1' }, loading: false, configError: null })

    expect(screen.getByText('Private page')).toBeInTheDocument()
  })

  it('redirects a signed-out user to login', () => {
    renderProtectedPage({ user: null, loading: false, configError: null })

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Private page')).not.toBeInTheDocument()
  })

  // Redirecting here would send signed-in users to login on every page refresh.
  it('waits while the session is being checked', () => {
    renderProtectedPage({ user: null, loading: true, configError: null })

    expect(screen.getByText('Checking your session…')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('explains a missing Firebase configuration', () => {
    renderProtectedPage({ user: null, loading: false, configError: 'Firebase is not configured.' })

    expect(screen.getByRole('alert')).toHaveTextContent('Firebase is not configured.')
    expect(screen.queryByText('Private page')).not.toBeInTheDocument()
  })
})
