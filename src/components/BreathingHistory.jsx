import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from './ui/ErrorMessage'
import { BREATHING_EXERCISES, formatDuration, getExerciseById } from '../lib/breathingExercises'

function sessionDate(session) {
  const value = session.completedAt || session.createdAt
  const date = value?.toDate?.() || (value ? new Date(value) : null)
  if (!date || Number.isNaN(date.getTime())) return null
  return date
}

function parseLocalDate(value, endOfDay = false) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  )
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

function GoodSessionReason({ session, pending, onSave }) {
  const [reason, setReason] = useState(session.goodSessionReason || '')

  useEffect(() => {
    setReason(session.goodSessionReason || '')
  }, [session.goodSessionReason])

  const saved = (session.goodSessionReason || '').trim()
  const changed = reason.trim() !== saved

  return (
    <form
      className="mt-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!changed || pending) return
        onSave?.(session, reason)
      }}
    >
      <label className="block text-sm font-semibold text-bloom-navy" htmlFor={`good-reason-${session.id}`}>
        Why was this good?
        <textarea
          id={`good-reason-${session.id}`}
          value={reason}
          maxLength={280}
          rows={2}
          placeholder="A sentence about what made this session good."
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 block w-full resize-none rounded-md border border-bloom-border bg-white px-3 py-2 text-sm font-medium text-bloom-navy outline-none focus:border-bloom-lavender"
        />
      </label>
      {changed ? (
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-bloom-navy border border-bloom-border disabled:opacity-60"
        >
          Save reason
        </button>
      ) : null}
    </form>
  )
}

export default function BreathingHistory({
  sessions,
  loading,
  error,
  onRepeat,
  onToggleGoodSession,
  onSaveGoodReason,
  pendingSessionId,
}) {
  const [exerciseFilter, setExerciseFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filteredSessions = useMemo(() => {
    const from = parseLocalDate(startDate)
    const to = parseLocalDate(endDate, true)
    return sessions.filter((session) => {
      if (exerciseFilter !== 'all' && session.exerciseType !== exerciseFilter) return false
      const completed = sessionDate(session)
      if (from && (!completed || completed < from)) return false
      if (to && (!completed || completed > to)) return false
      return true
    })
  }, [sessions, exerciseFilter, startDate, endDate])

  const goodCount = sessions.filter((session) => session.goodSession).length

  return (
    <section className="rounded-md border border-bloom-border bg-white px-5 py-6 sm:px-7">
      <p className="text-xs font-bold tracking-[0.18em] text-bloom-lavender uppercase">
        Last 30 days
      </p>
      <h2 className="mt-2 text-2xl font-extrabold text-bloom-navy">Finished sessions</h2>
      <p className="mt-1 text-sm text-bloom-navy/70">
        {loading ? 'Loading finished sessions…' : `${sessions.length} finished · ${goodCount} marked good`}
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by exercise">
        {[{ id: 'all', name: 'All exercises' }, ...BREATHING_EXERCISES].map((exercise) => {
          const pressed = exerciseFilter === exercise.id
          return (
            <button
              key={exercise.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setExerciseFilter(exercise.id)}
              className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                pressed
                  ? 'bg-bloom-lavender text-white'
                  : 'bg-bloom-bg text-bloom-navy hover:bg-bloom-blue-soft'
              }`}
            >
              {exercise.name}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block text-sm font-semibold text-bloom-navy">
          From
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1 block w-full rounded-md border border-bloom-border bg-white px-3 py-2 text-sm font-medium text-bloom-navy outline-none focus:border-bloom-lavender"
          />
        </label>
        <label className="block text-sm font-semibold text-bloom-navy">
          To
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1 block w-full rounded-md border border-bloom-border bg-white px-3 py-2 text-sm font-medium text-bloom-navy outline-none focus:border-bloom-lavender"
          />
        </label>
        {startDate || endDate ? (
          <button
            type="button"
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="rounded-md px-4 py-2 text-sm font-bold text-bloom-lavender hover:bg-bloom-lavender/10"
          >
            Clear dates
          </button>
        ) : null}
      </div>

      <ErrorMessage message={error} className="mt-5" />

      {loading ? (
        <p className="mt-6 text-sm text-bloom-muted">Looking through finished sessions…</p>
      ) : null}

      {!loading && !error && sessions.length === 0 ? (
        <p className="mt-6 text-sm text-bloom-navy/75">
          No finished sessions yet. Complete an exercise above and it will show up here.
        </p>
      ) : null}

      {!loading && sessions.length > 0 && filteredSessions.length === 0 ? (
        <p className="mt-6 text-sm text-bloom-navy/75">
          Nothing finished in this range. Clear the dates or choose another exercise.
        </p>
      ) : null}

      {!loading && filteredSessions.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {filteredSessions.map((session) => {
            const exercise = getExerciseById(session.exerciseType)
            const name = exercise?.name || 'Breathing session'
            const marked = Boolean(session.goodSession)
            const pending = pendingSessionId === session.id
            return (
              <li
                key={session.id}
                className="rounded-md bg-bloom-blue-soft px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-extrabold text-bloom-navy">{name}</p>
                  <p className="mt-1 text-sm text-bloom-navy/75">
                    {formatWhen(sessionDate(session))} · {session.cyclesCompleted} cycles ·{' '}
                    {formatDuration(session.durationSeconds || 0)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={marked}
                    disabled={pending}
                    onClick={() => onToggleGoodSession?.(session)}
                    className={`rounded-md px-4 py-2 text-sm font-bold disabled:opacity-60 ${
                      marked
                        ? 'bg-bloom-green text-bloom-navy'
                        : 'bg-white text-bloom-navy border border-bloom-border'
                    }`}
                  >
                    {marked ? 'Good session' : 'Mark good session'}
                  </button>
                  {exercise ? (
                    <button
                      type="button"
                      onClick={() => onRepeat?.(session.exerciseType)}
                      className="rounded-md bg-white px-4 py-2 text-sm font-bold text-bloom-lavender"
                    >
                      Repeat
                    </button>
                  ) : null}
                </div>
                </div>
                {marked ? (
                  <GoodSessionReason
                    session={session}
                    pending={pending}
                    onSave={onSaveGoodReason}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
