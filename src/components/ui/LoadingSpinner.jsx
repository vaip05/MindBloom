export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-bloom-muted">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-bloom-lavender/30 border-t-bloom-lavender" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
