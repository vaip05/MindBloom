import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import Register from './Register'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const VALID_ACCOUNT = {
  name: 'Bloom',
  email: 'bloom@example.com',
  password: 'secret1',
  confirmPassword: 'secret1',
}

function renderRegister(register = vi.fn().mockResolvedValue({ uid: 'user-1' })) {
  useAuth.mockReturnValue({ register, user: null, configError: null })
  const { container } = render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<p>Home page</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return { register, submitButton: container.querySelector('button[type="submit"]') }
}

async function fillAndSubmit(submitButton, account) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Name'), account.name)
  await user.type(screen.getByLabelText('Email address'), account.email)
  await user.type(screen.getByLabelText('Password'), account.password)
  await user.type(screen.getByLabelText('Confirm password'), account.confirmPassword)
  await user.click(submitButton)
}

describe('Register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requires a name', async () => {
    const { register, submitButton } = renderRegister()

    await userEvent.setup().click(submitButton)

    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('rejects passwords that do not match', async () => {
    const { register, submitButton } = renderRegister()

    await fillAndSubmit(submitButton, { ...VALID_ACCOUNT, confirmPassword: 'different1' })

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('creates the account and goes home', async () => {
    const { register, submitButton } = renderRegister()

    await fillAndSubmit(submitButton, VALID_ACCOUNT)

    expect(register).toHaveBeenCalledWith(VALID_ACCOUNT)
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('shows why registration failed', async () => {
    const register = vi.fn().mockRejectedValue(new Error('This email already has an account.'))
    const { submitButton } = renderRegister(register)

    await fillAndSubmit(submitButton, VALID_ACCOUNT)

    expect(await screen.findByRole('alert')).toHaveTextContent('This email already has an account.')
  })
})
