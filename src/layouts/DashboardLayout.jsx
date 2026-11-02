import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { clearReminderSchedule, syncReminderSchedule } from '../lib/reminderSchedule'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [reminder, setReminder] = useState(null)

  useEffect(() => {
    function onReminder(event) {
      setReminder(event.detail)
    }
    window.addEventListener('mindbloom-reminder', onReminder)
    return () => window.removeEventListener('mindbloom-reminder', onReminder)
  }, [])

  useEffect(() => {
    if (!user) return undefined
    syncReminderSchedule(user.uid).catch(() => {})
    return () => clearReminderSchedule()
  }, [user])

  return (
    <div className="flex min-h-screen bg-bloom-bg">
      {reminder ? (
        <div className="fixed top-4 right-4 z-[70] w-[min(100%-2rem,22rem)] rounded-md border border-bloom-border bg-white px-4 py-4 shadow-lg">
          <p className="text-xs font-bold tracking-[0.16em] text-bloom-lavender uppercase">Reminder</p>
          <p className="mt-1 text-lg font-extrabold text-bloom-navy">{reminder.title}</p>
          <p className="mt-1 text-bloom-navy/80">{reminder.body}</p>
          <button
            type="button"
            onClick={() => setReminder(null)}
            className="mt-3 text-sm font-bold text-bloom-lavender"
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <Sidebar />
      <main className="flex-1 px-4 pt-16 pb-8 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto w-full max-w-6xl animate-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
