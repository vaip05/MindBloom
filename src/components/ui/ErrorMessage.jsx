export default function ErrorMessage({ message, className = '' }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={`rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/70 dark:text-red-200 ${className}`}
    >
      {message}
    </div>
  )
}
