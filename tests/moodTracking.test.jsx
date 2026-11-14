import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoodStress from '../src/pages/MoodStress'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  saveMoodEntry: vi.fn(),
}))

vi.mock('../src/context/AuthContext', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../src/services/firestoreServices', () => ({
  saveMoodEntry: mocks.saveMoodEntry,
}))

describe('mood and stress tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.useAuth.mockReturnValue({
      user: {
        uid: 'test-user-123',
      },
    })

    mocks.saveMoodEntry.mockResolvedValue({
      id: 'mood-entry-123',
    })
  })

  it('requires the user to select a mood before saving', async () => {
    render(<MoodStress />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Save check-in' }),
    )

    expect(
      await screen.findByText('Choose a mood first.'),
    ).toBeInTheDocument()

    expect(mocks.saveMoodEntry).not.toHaveBeenCalled()
  })

  it('saves the selected mood, stress level, and trimmed note', async () => {
    render(<MoodStress />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Great',
        exact: true,
      }),
    )

    fireEvent.change(
      screen.getByLabelText('Stress level'),
      {
        target: { value: '4' },
      },
    )

    fireEvent.change(
      screen.getByLabelText('Note (optional)'),
      {
        target: {
          value: '  Feeling better today.  ',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Save check-in' }),
    )

    await waitFor(() => {
      expect(mocks.saveMoodEntry).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          moodId: 'great',
          stressLevel: 4,
          note: 'Feeling better today.',
        }),
      )
    })

    expect(
      screen.getByText('Check-in saved.'),
    ).toBeInTheDocument()
  })

  it('shows an error when saving fails', async () => {
    mocks.saveMoodEntry.mockRejectedValue(
      new Error('Unable to save check-in'),
    )

    render(<MoodStress />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Great',
        exact: true,
      }),
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Save check-in' }),
    )

    expect(
      await screen.findByText('Unable to save check-in'),
    ).toBeInTheDocument()
  })
})