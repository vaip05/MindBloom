import Moon from 'lucide-react/dist/esm/icons/moon.mjs'
import Sun from 'lucide-react/dist/esm/icons/sun.mjs'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-bloom-border bg-bloom-card text-sm font-bold text-bloom-navy shadow-sm transition hover:border-bloom-lavender ${
        compact ? 'p-2.5' : 'px-4 py-2.5'
      } ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" strokeWidth={1.75} /> : <Moon className="h-5 w-5" strokeWidth={1.75} />}
      {compact ? null : <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}
