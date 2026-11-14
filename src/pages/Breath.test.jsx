import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { getBreathingSessions, saveBreathingSession } from '../services/firestoreServices'
import Breath from './Breath'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../services/firestoreServices', () => ({
  getBreathingSessions: vi.fn(),
  saveBreathingSession: vi.fn(),
  updateBreathingSession: vi.fn(),
}))

const FINISHED_SESSION = {
  exerciseType: 'box',
  durationSeconds: 64,
  cyclesCompleted: 4,
}

// The real session screen runs for over a minute and needs browser audio, which
// jsdom lacks. Its timing is covered by useBreathingTimer.test.js.
vi.mock('../components/BreathingExercise', () => ({
  default: ({ onComplete, onExit }) => (
    <>
      <button type="button" onClick={() => onComplete(FINISHED_SESSION)}>
        Finish session
      </button>
      <button type="button" onClick={onExit}>
        Exit session
      </button>
    </>
  ),
}))
vi.mock('../components/BreathingHistory', () => ({
  default: ({ error }) => <p>History {error}</p>,
}))

describe('Breath', () => {
  let user

  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: { uid: 'user-1' } })
    getBreathingSessions.mockResolvedValue([])
    saveBreathingSession.mockResolvedValue({ id: 'session-1' })
    user = userEvent.setup()
  })

  async function startBoxBreathingSession() {
    render(<Breath />)
    await user.click(screen.getByRole('button', { name: 'Start Box Breathing' }))
  }

  it('offers every exercise and selects the first one', async () => {
    render(<Breath />)

    expect(screen.getByRole('button', { name: /^Box Breathing/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^4-7-8 Breathing/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Coherent Breathing/ })).toBeInTheDocument()
    await screen.findByText(/^History/)
  })

  it('shows instructions and the recommended duration for the chosen exercise', async () => {
    render(<Breath />)

    await user.click(screen.getByRole('button', { name: /^4-7-8 Breathing/ }))

    expect(screen.getByText('In 4 · Hold 7 · Out 8')).toBeInTheDocument()
    expect(screen.getByText(/Recommended: 4 cycles · 1 min 16 sec/)).toBeInTheDocument()
    expect(screen.getByText('Sit or lie down.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start 4-7-8 Breathing' })).toBeInTheDocument()
  })

  it('includes the dizziness warning', async () => {
    render(<Breath />)

    expect(screen.getByText(/Stop and breathe normally if you feel dizzy/)).toBeInTheDocument()
    await screen.findByText(/^History/)
  })

  it('saves a finished session and confirms it', async () => {
    await startBoxBreathingSession()

    await user.click(screen.getByRole('button', { name: 'Finish session' }))

    expect(saveBreathingSession).toHaveBeenCalledWith('user-1', FINISHED_SESSION)
    expect(await screen.findByText('Session finished')).toBeInTheDocument()
    expect(screen.getByText('Saved to your history.')).toBeInTheDocument()
    expect(getBreathingSessions).toHaveBeenCalledTimes(2)
  })

  it('still finishes the session when saving fails', async () => {
    saveBreathingSession.mockRejectedValue(new Error('Could not reach Firestore.'))
    await startBoxBreathingSession()

    await user.click(screen.getByRole('button', { name: 'Finish session' }))

    expect(await screen.findByText('Session finished')).toBeInTheDocument()
    expect(screen.getByText('Could not reach Firestore.')).toBeInTheDocument()
    expect(screen.queryByText('Saved to your history.')).not.toBeInTheDocument()
  })

  it('does not save a session the user ended early', async () => {
    await startBoxBreathingSession()

    await user.click(screen.getByRole('button', { name: 'Exit session' }))

    expect(saveBreathingSession).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Start Box Breathing' })).toBeInTheDocument()
  })

  it('reports a history that fails to load', async () => {
    getBreathingSessions.mockRejectedValue(new Error('History unavailable.'))
    render(<Breath />)

    expect(await screen.findByText('History History unavailable.')).toBeInTheDocument()
  })
})
