import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { saveMoodEntry } from '../services/firestoreServices'
import MoodStress from './MoodStress'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../services/firestoreServices', () => ({ saveMoodEntry: vi.fn() }))

function clickSave(user) {
  return user.click(screen.getByRole('button', { name: 'Save check-in' }))
}

describe('MoodStress', () => {
  let user

  beforeEach(() => {
    vi.clearAllMocks()
    saveMoodEntry.mockResolvedValue({ id: 'entry-1' })
    useAuth.mockReturnValue({ user: { uid: 'user-1' } })
    user = userEvent.setup()
  })

  it('requires a mood before saving', async () => {
    render(<MoodStress />)

    await clickSave(user)

    expect(screen.getByRole('alert')).toHaveTextContent('Choose a mood first.')
    expect(saveMoodEntry).not.toHaveBeenCalled()
  })

  it('requires a signed-in user', async () => {
    useAuth.mockReturnValue({ user: null })
    render(<MoodStress />)

    await user.click(screen.getByRole('button', { name: 'Okay' }))
    await clickSave(user)

    expect(screen.getByRole('alert')).toHaveTextContent('Sign in before saving a check-in.')
    expect(saveMoodEntry).not.toHaveBeenCalled()
  })

  it('saves the mood, stress level, and trimmed note for the signed-in user', async () => {
    render(<MoodStress />)

    await user.click(screen.getByRole('button', { name: 'Okay' }))
    fireEvent.change(screen.getByLabelText('Stress level'), { target: { value: '5' } })
    await user.type(screen.getByRole('textbox'), '  Busy day  ')
    await clickSave(user)

    expect(saveMoodEntry).toHaveBeenCalledWith('user-1', {
      moodId: 'okay',
      moodValue: 3,
      stressLevel: 5,
      note: 'Busy day',
    })
  })

  it('confirms the save and clears the form', async () => {
    render(<MoodStress />)

    await user.click(screen.getByRole('button', { name: 'Good' }))
    await user.type(screen.getByRole('textbox'), 'Nice walk')
    await clickSave(user)

    expect(await screen.findByText('Check-in saved.')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Good' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps what the user typed when saving fails', async () => {
    saveMoodEntry.mockRejectedValue(new Error('Network unavailable.'))
    render(<MoodStress />)

    await user.click(screen.getByRole('button', { name: 'Good' }))
    await user.type(screen.getByRole('textbox'), 'Nice walk')
    await clickSave(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable.')
    expect(screen.getByRole('textbox')).toHaveValue('Nice walk')
  })

  it('prevents a double save while one is in progress', async () => {
    let finishSaving
    saveMoodEntry.mockReturnValue(
      new Promise((resolve) => {
        finishSaving = resolve
      }),
    )
    render(<MoodStress />)

    await user.click(screen.getByRole('button', { name: 'Good' }))
    await clickSave(user)

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
    finishSaving()
    expect(await screen.findByText('Check-in saved.')).toBeInTheDocument()
  })
})
