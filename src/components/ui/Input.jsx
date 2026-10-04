export default function Input({
  id,
  label,
  type = 'text',
  error,
  leftIcon,
  rightSlot,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-bloom-navy">
          {label}
        </label>
      ) : null}
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition focus-within:border-bloom-lavender focus-within:ring-2 focus-within:ring-bloom-lavender/20 ${
          error ? 'border-red-300' : 'border-bloom-border'
        }`}
      >
        {leftIcon ? <span className="shrink-0 text-bloom-muted">{leftIcon}</span> : null}
        <input
          id={id}
          type={type}
          className="w-full border-0 bg-transparent text-bloom-navy placeholder:text-bloom-muted/70 outline-none"
          {...props}
        />
        {rightSlot ? <span className="shrink-0">{rightSlot}</span> : null}
      </div>
      {error ? <p className="mt-1.5 text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
