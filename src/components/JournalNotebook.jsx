import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import Button from './ui/Button'
import { useAuth } from '../context/AuthContext'
import { JOURNAL_PROMPTS } from '../lib/journalPrompts'
import { saveJournalEntry } from '../services/firestoreServices'

export default function JournalNotebook({ entry, kind = 'free', prompt = '', onClose, onSaved }) {
  const { user } = useAuth()
  const [title, setTitle] = useState(entry?.title && entry.title !== 'Untitled' ? entry.title : '')
  const [body, setBody] = useState(entry?.body || '')
  const [chosenPrompt, setChosenPrompt] = useState(entry?.prompt || prompt || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(event) {
    event.preventDefault()
    if (!user || !body.trim()) return
    setSaving(true)
    setError('')
    try {
      const savedKind = entry?.id ? entry.kind || kind : chosenPrompt ? 'prompt' : 'free'
      const saved = await saveJournalEntry(user.uid, {
        id: entry?.id,
        title,
        body,
        kind: savedKind,
        prompt: savedKind === 'prompt' ? chosenPrompt || entry?.prompt || prompt : '',
      })
      onSaved?.(saved)
      onClose()
    } catch (saveError) {
      setError(saveError?.message || 'Could not save this page.')
      setSaving(false)
    }
  }

  const choosing = !entry?.id && (entry?.kind || kind) !== 'suggestion'
  const pageKind = entry?.id ? entry.kind || kind : chosenPrompt ? 'prompt' : 'free'
  const pagePrompt = chosenPrompt || entry?.prompt || prompt
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-bloom-navy/30">
      <div className="flex min-h-full items-center justify-center p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-title"
        onSubmit={handleSave}
        className="w-full max-w-xl overflow-hidden rounded-md bg-[#fff8ee] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[#eadfce] px-5 py-3">
          <p id="notebook-title" className="text-sm font-bold text-bloom-navy">
            {entry?.id
              ? 'Edit page'
              : pageKind === 'suggestion'
                ? 'Suggestion page'
                : pageKind === 'prompt'
                  ? 'Prompt page'
                  : 'New page'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-bloom-muted hover:text-bloom-navy"
          >
            Close
          </button>
        </div>
        <div className="relative px-5 py-4">
          <div className="pointer-events-none absolute top-0 bottom-0 left-12 w-px bg-[#e7a3a8]" aria-hidden="true" />
          <p className="pl-10 text-xs font-semibold tracking-wide text-[#b08968] uppercase">{today}</p>
          {choosing ? (
            <label className="relative mt-3 block pl-10">
              <span className="sr-only">Choose a prompt or your own page</span>
              <select
                value={chosenPrompt}
                onChange={(event) => setChosenPrompt(event.target.value)}
                className="w-full appearance-none rounded-md border border-[#eadfce] bg-transparent px-3 py-2 pr-10 text-base font-semibold text-[#b08968] outline-none focus:border-[#e7a3a8]"
              >
                <option value="">My own page</option>
                {JOURNAL_PROMPTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#b08968]"
                strokeWidth={1.75}
              />
            </label>
          ) : null}
          {pageKind === 'suggestion' ? (
            <p className="mt-2 pl-10 text-sm font-semibold text-bloom-lavender">From wellness suggestions</p>
          ) : null}
          {pageKind === 'prompt' && pagePrompt && !choosing ? (
            <p className="mt-2 pl-10 text-lg text-bloom-navy/80 italic">{pagePrompt}</p>
          ) : null}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            maxLength={80}
            className="mt-2 w-full border-0 bg-transparent pl-10 text-2xl font-bold text-bloom-navy outline-none placeholder:text-bloom-navy/30"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a few lines..."
            rows={10}
            maxLength={4000}
            style={{
              lineHeight: '32px',
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #eadfce 32px)',
              backgroundAttachment: 'local',
            }}
            className="mt-2 w-full resize-none border-0 bg-transparent pl-10 text-lg text-bloom-navy outline-none placeholder:text-bloom-navy/30"
          />
        </div>
        {error ? <p className="px-5 pb-2 text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end border-t border-[#eadfce] px-5 py-3">
          <Button type="submit" disabled={saving || !body.trim()}>
            {saving ? 'Saving…' : 'Save page'}
          </Button>
        </div>
      </form>
      </div>
    </div>,
    document.body,
  )
}
