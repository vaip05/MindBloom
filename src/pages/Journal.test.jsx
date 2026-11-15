import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { getJournalEntries } from '../services/firestoreServices'
import Journal from './Journal'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../services/firestoreServices', () => ({
  deleteJournalEntry: vi.fn(),
  getJournalEntries: vi.fn(),
}))

const journalEntries = [
  { id: 'one', title: 'Morning thoughts', body: 'A quiet start.', kind: 'free' },
  { id: 'two', title: 'Prompted page', body: 'Today I felt supported.', kind: 'prompt', prompt: 'What helped today?' },
]

describe('Journal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: { uid: 'user-1' } })
    getJournalEntries.mockResolvedValue(journalEntries)
  })

  it('loads all journal entries for the signed-in user and searches titles', async () => {
    const user = userEvent.setup()
    render(<Journal />)
    await screen.findByText('Your notebook')
    expect(getJournalEntries).toHaveBeenCalledWith('user-1')

    await user.type(screen.getByRole('searchbox', { name: 'Search journal entries' }), 'morning')

    expect(await screen.findByText('Morning thoughts')).toBeInTheDocument()
    expect(screen.queryByText('Prompted page')).not.toBeInTheDocument()
  })

  it('searches entry bodies and shows a no-match state', async () => {
    const user = userEvent.setup()
    render(<Journal />)
    const search = await screen.findByRole('searchbox', { name: 'Search journal entries' })

    await user.type(search, 'felt supported')
    expect(await screen.findByText('Prompted page')).toBeInTheDocument()
    expect(screen.queryByText('Morning thoughts')).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'missing phrase')
    expect(await screen.findByText(/No journal pages match/)).toBeInTheDocument()
  })

  it('downloads the complete journal export, independent of the current search filter', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.fn(() => 'blob:journal-export')
    const revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    render(<Journal />)
    await screen.findByText('Your notebook')
    const search = screen.getByRole('searchbox', { name: 'Search journal entries' })
    await user.type(search, 'morning')
    await user.click(screen.getByRole('button', { name: 'Export journal JSON' }))

    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/json' }))
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.contexts[0].download).toMatch(/^mindbloom-journal-\d{4}-\d{2}-\d{2}\.json$/)
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:journal-export'))
    expect(getJournalEntries).toHaveBeenCalledWith('user-1')

    click.mockRestore()
    vi.unstubAllGlobals()
  })
})
