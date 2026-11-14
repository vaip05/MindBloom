import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import {
  getLatestMood,
  getLatestStress,
  getSuggestions,
  refreshSuggestions,
} from '../services/firestoreServices'
import Suggestions from './Suggestions'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../services/firestoreServices', () => ({
  getLatestMood: vi.fn(),
  getLatestStress: vi.fn(),
  getSuggestions: vi.fn(),
  refreshSuggestions: vi.fn(),
  saveJournalEntry: vi.fn(),
}))

const BREATHING_SUGGESTION = {
  id: 'stress-high',
  title: 'Ease the pressure',
  body: 'Try Box Breathing.',
  tag: 'Stress',
  reason: 'Shown because your latest stress is high.',
  action: { label: 'Start a breathing exercise', to: '/breathe' },
}
const REFRESHED_SUGGESTION = {
  id: 'okay-3',
  title: 'Change the view',
  body: 'Look out of a window.',
  tag: 'Environment',
}

function renderSuggestions() {
  render(
    <MemoryRouter>
      <Suggestions />
    </MemoryRouter>,
  )
}

describe('Suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: { uid: 'user-1' } })
    getSuggestions.mockResolvedValue([BREATHING_SUGGESTION])
    getLatestMood.mockResolvedValue({ moodId: 'okay' })
    getLatestStress.mockResolvedValue({ stressLevel: 4 })
  })

  it('shows a spinner until the suggestions load', async () => {
    renderSuggestions()

    expect(screen.getByText('Finding suggestions…')).toBeInTheDocument()
    expect(await screen.findByText('Ease the pressure')).toBeInTheDocument()
    expect(screen.queryByText('Finding suggestions…')).not.toBeInTheDocument()
  })

  it('loads data for the signed-in user only', async () => {
    renderSuggestions()
    await screen.findByText('Ease the pressure')

    expect(getSuggestions).toHaveBeenCalledWith('user-1')
    expect(getLatestMood).toHaveBeenCalledWith('user-1')
    expect(getLatestStress).toHaveBeenCalledWith('user-1')
  })

  it('shows the check-in behind the suggestions', async () => {
    renderSuggestions()

    expect(await screen.findByText(/Okay · High stress/)).toBeInTheDocument()
  })

  it('tells a new user to log a mood', async () => {
    getLatestMood.mockResolvedValue(null)
    getLatestStress.mockResolvedValue(null)
    renderSuggestions()

    expect(await screen.findByText('No check-ins yet')).toBeInTheDocument()
    expect(screen.getByText(/Log a mood to personalize them/)).toBeInTheDocument()
  })

  it('links a suggestion to its feature', async () => {
    renderSuggestions()

    const actionButton = await screen.findByRole('button', { name: /Start a breathing exercise/ })
    expect(actionButton.closest('a')).toHaveAttribute('href', '/breathe')
  })

  it('explains why a suggestion is shown', async () => {
    renderSuggestions()

    expect(await screen.findByText('Shown because your latest stress is high.')).toBeInTheDocument()
  })

  // Snapshots saved before journaling existed have no journal suggestion in them.
  it('adds the journal option to older saved suggestions', async () => {
    renderSuggestions()

    expect(await screen.findByText('Write it in the notebook')).toBeInTheDocument()
  })

  it('shows an error when loading fails', async () => {
    getSuggestions.mockRejectedValue(new Error('Could not load suggestions.'))
    renderSuggestions()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load suggestions.')
    expect(screen.queryByText('Finding suggestions…')).not.toBeInTheDocument()
  })

  it('replaces the suggestions on refresh', async () => {
    refreshSuggestions.mockResolvedValue([REFRESHED_SUGGESTION])
    const user = userEvent.setup()
    renderSuggestions()
    await screen.findByText('Ease the pressure')

    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(await screen.findByText('Change the view')).toBeInTheDocument()
    expect(screen.queryByText('Ease the pressure')).not.toBeInTheDocument()
    expect(refreshSuggestions).toHaveBeenCalledWith('user-1')
  })

  it('keeps the current suggestions when a refresh fails', async () => {
    refreshSuggestions.mockRejectedValue(new Error('Refresh failed.'))
    const user = userEvent.setup()
    renderSuggestions()
    await screen.findByText('Ease the pressure')

    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Refresh failed.')
    expect(screen.getByText('Ease the pressure')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled())
  })
})
