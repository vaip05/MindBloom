import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import Login from './Login'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const VALID_EMAIL = 'bloom@example.com'
const VALID_PASSWORD = 'secret1'

function renderLogin(authOverrides = {}) {
  const login = vi.fn().mockResolvedValue({ uid: 'user-1' })
  useAuth.mockReturnValue({ login, user: null, configError: null, ...authOverrides })
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<p>Home page</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return { login }
}

async function submitLogin({ email, password }) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByLabelText('Email address'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requires an email and password', async () => {
    const { login } = renderLogin()

    await submitLogin({})

    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('rejects a malformed email', async () => {
    const { login } = renderLogin()

    await submitLogin({ email: 'not-an-email', password: VALID_PASSWORD })

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('rejects a short password', async () => {
    const { login } = renderLogin()

    await submitLogin({ email: VALID_EMAIL, password: '12345' })

    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('logs in and goes home', async () => {
    const { login } = renderLogin()

    await submitLogin({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(login).toHaveBeenCalledWith({ email: VALID_EMAIL, password: VALID_PASSWORD })
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('shows why a login failed and stays on the page', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Invalid email or password.'))
    renderLogin({ login })

    await submitLogin({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
  })

  it('sends a signed-in user straight home', () => {
    renderLogin({ user: { uid: 'user-1' } })

    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})
