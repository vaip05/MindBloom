import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import JournalNotebook from '../components/JournalNotebook'
import { useAuth } from '../context/AuthContext'
import { deleteJournalEntry, getJournalEntries } from '../services/firestoreServices'

function entryDate(entry) {
  const value = entry.createdAt || entry.updatedAt
  const date = value?.toDate?.() || (value ? new Date(value) : null)
  if (!date || Number.isNaN(date.getTime())) return null
  return date
}

function formatWhen(date) {
  if (!date) return 'Just now'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SectionDropdown({ label, open, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-md border border-bloom-border bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-lg font-extrabold text-bloom-lavender">{label}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-bloom-lavender transition ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.75}
        />
      </button>
      {open ? <div className="space-y-3 border-t border-bloom-border px-5 py-4">{children}</div> : null}
    </section>
  )
}

function EntryList({ entries, empty, onOpen, onDelete }) {
  if (entries.length === 0) {
    return <p className="text-sm text-bloom-navy/75">{empty}</p>
  }
  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-md border border-bloom-border bg-[#fff8ee] px-5 py-4">
          <button type="button" onClick={() => onOpen(entry)} className="block w-full text-left">
            <p className="text-xs font-semibold text-[#b08968]">{formatWhen(entryDate(entry))}</p>
            {entry.kind === 'prompt' && entry.prompt ? (
              <p className="mt-1 text-sm text-bloom-navy/70 italic">{entry.prompt}</p>
            ) : null}
            {entry.kind === 'prompt' && entry.prompt?.startsWith(entry.title) ? null : (
              <h3 className="mt-1 text-xl font-extrabold text-bloom-navy">{entry.title || 'Untitled'}</h3>
            )}
            <p className="mt-1 line-clamp-2 text-sm text-bloom-navy/75">{entry.body}</p>
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="mt-3 text-sm font-bold text-bloom-muted hover:text-bloom-navy"
          >
            Delete page
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openEntry, setOpenEntry] = useState(undefined)
  const [openSections, setOpenSections] = useState({})

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) return
      setLoading(true)
      setError('')
      try {
        const pages = await getJournalEntries(user.uid)
        if (active) setEntries(pages)
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Could not load your journal.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  async function handleDelete(entry) {
    if (!user) return
    const previous = entries
    setEntries((current) => current.filter((item) => item.id !== entry.id))
    try {
      await deleteJournalEntry(user.uid, entry.id)
    } catch (deleteError) {
      setEntries(previous)
      setError(deleteError?.message || 'Could not delete that page.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-bloom-lavender uppercase">
            Journaling
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-bloom-navy">Your notebook</h1>
          <p className="mt-2 max-w-2xl text-bloom-navy/80">
            Suggestion pages, your own pages, and prompted pages each stay in their own section.
          </p>
        </div>
        <Button onClick={() => setOpenEntry({ kind: 'free' })}>New page</Button>
      </header>

      <ErrorMessage message={error} />

      {loading ? <p className="text-sm text-bloom-muted">Loading pages…</p> : null}

      {!loading ? (
        <div className="space-y-3">
          <SectionDropdown
            label="From wellness suggestions"
            open={Boolean(openSections.suggestion)}
            onToggle={() =>
              setOpenSections((current) => ({ ...current, suggestion: !current.suggestion }))
            }
          >
            <EntryList
              entries={entries.filter((entry) => entry.kind === 'suggestion')}
              empty="Pages you save from the notebook on Wellness Suggestions show up here."
              onOpen={setOpenEntry}
              onDelete={handleDelete}
            />
          </SectionDropdown>

          <SectionDropdown
            label="Your pages"
            open={Boolean(openSections.free)}
            onToggle={() => setOpenSections((current) => ({ ...current, free: !current.free }))}
          >
            <EntryList
              entries={entries.filter((entry) => entry.kind !== 'suggestion' && entry.kind !== 'prompt')}
              empty="No pages yet. Start one with New page."
              onOpen={setOpenEntry}
              onDelete={handleDelete}
            />
          </SectionDropdown>

          <SectionDropdown
            label="Prompted pages"
            open={Boolean(openSections.prompt)}
            onToggle={() => setOpenSections((current) => ({ ...current, prompt: !current.prompt }))}
          >
            <EntryList
              entries={entries.filter((entry) => entry.kind === 'prompt')}
              empty="No prompted pages yet. Open New page and choose a prompt."
              onOpen={setOpenEntry}
              onDelete={handleDelete}
            />
          </SectionDropdown>
        </div>
      ) : null}

      {openEntry !== undefined ? (
        <JournalNotebook
          entry={openEntry}
          kind={openEntry?.kind || 'free'}
          prompt={openEntry?.prompt || ''}
          onClose={() => setOpenEntry(undefined)}
          onSaved={(saved) => {
            setEntries((current) => {
              const without = current.filter((item) => item.id !== saved.id)
              return [{ ...openEntry, ...saved, createdAt: openEntry?.createdAt || new Date() }, ...without]
            })
          }}
        />
      ) : null}
    </div>
  )
}
