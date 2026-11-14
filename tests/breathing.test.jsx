import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Breath from '../src/pages/Breath'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getBreathingSessions: vi.fn(),
  saveBreathingSession: vi.fn(),
  updateBreathingSession: vi.fn(),
}))

vi.mock('../src/context/AuthContext', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../src/services/firestoreServices', () => ({
  getBreathingSessions: mocks.getBreathingSessions,
  saveBreathingSession: mocks.saveBreathingSession,
  updateBreathingSession: mocks.updateBreathingSession,
}))

vi.mock('../src/components/BreathingExercise', () => ({
  default: ({ onComplete, onExit }) => (
    <div>
      <p>Mock breathing exercise</p>

      <button
        type="button"
        onClick={() =>
          onComplete({
            exerciseType: 'box',
            durationSeconds: 64,
            cyclesCompleted: 4,
            completedAt: new Date(),
          })
        }
      >
        Complete mock session
      </button>

      <button type="button" onClick={onExit}>
        Exit mock session
      </button>
    </div>
  ),
}))

vi.mock('../src/components/BreathingHistory', () => ({
  default: () => <div>Mock breathing history</div>,
}))

describe('breathing exercises', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.useAuth.mockReturnValue({
      user: {
        uid: 'test-user-123',
      },
    })

    mocks.getBreathingSessions.mockResolvedValue([])
    mocks.saveBreathingSession.mockResolvedValue({
      id: 'breathing-session-123',
    })
    mocks.updateBreathingSession.mockResolvedValue(undefined)
  })

  it('loads breathing history for the authenticated user', async () => {
    render(<Breath />)

    await waitFor(() => {
      expect(mocks.getBreathingSessions).toHaveBeenCalledWith(
        'test-user-123',
      )
    })

    expect(
      screen.getByText('Mock breathing history'),
    ).toBeInTheDocument()
  })

  it('starts and saves a completed breathing session', async () => {
    render(<Breath />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Start Box Breathing',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Complete mock session',
      }),
    )

    await waitFor(() => {
      expect(mocks.saveBreathingSession).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          exerciseType: 'box',
          durationSeconds: 64,
          cyclesCompleted: 4,
          completedAt: expect.any(Date),
        }),
      )
    })

    expect(
      await screen.findByText('Session finished'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Saved to your history.'),
    ).toBeInTheDocument()
  })

  it('allows the user to exit a breathing session', async () => {
    render(<Breath />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Start Box Breathing',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Exit mock session',
      }),
    )

    expect(
      await screen.findByRole('button', {
        name: 'Start Box Breathing',
      }),
    ).toBeInTheDocument()
  })
})