export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloom-lavender disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'bg-bloom-lavender text-white hover:bg-bloom-lavender-dark',
    secondary:
      'bg-white text-bloom-navy border border-bloom-border hover:border-bloom-lavender/50',
    ghost: 'bg-transparent text-bloom-lavender hover:bg-bloom-lavender/10',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
