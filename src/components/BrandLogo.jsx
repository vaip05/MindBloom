export function FlowerMark({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <ellipse cx="24" cy="14" rx="9" ry="12" fill="#F9B4BC" transform="rotate(-18 24 14)" />
      <ellipse cx="34" cy="22" rx="9" ry="12" fill="#FDE68A" transform="rotate(28 34 22)" />
      <ellipse cx="30" cy="34" rx="9" ry="12" fill="#A7F3D0" transform="rotate(72 30 34)" />
      <ellipse cx="16" cy="28" rx="9" ry="12" fill="#C4B5FD" transform="rotate(-52 16 28)" />
    </svg>
  )
}

export default function BrandLogo({ compact = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <FlowerMark className={compact ? 'h-8 w-8' : 'h-11 w-11'} />
      <div>
        <p className={`font-extrabold leading-none text-bloom-navy ${compact ? 'text-lg' : 'text-2xl'}`}>
          MindBloom
        </p>
        {!compact ? (
          <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.14em] text-bloom-muted uppercase">
            A calmer, brighter you
          </p>
        ) : null}
      </div>
    </div>
  )
}
