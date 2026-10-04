export default function SunriseIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 220 140"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#F6C95C" strokeWidth="2" strokeLinecap="round" className="animate-soft-pulse">
        <line x1="110" y1="8" x2="110" y2="22" />
        <line x1="72" y1="22" x2="82" y2="32" />
        <line x1="148" y1="22" x2="138" y2="32" />
        <line x1="52" y1="48" x2="66" y2="52" />
        <line x1="168" y1="48" x2="154" y2="52" />
      </g>
      <circle cx="110" cy="58" r="28" fill="#F6C95C" />
      <path
        d="M10 118 C48 78, 86 78, 118 104 C142 86, 168 84, 210 112 L210 140 L10 140 Z"
        fill="#FFD4B8"
      />
      <path
        d="M0 128 C40 96, 78 98, 112 122 C140 108, 170 106, 220 128 L220 140 L0 140 Z"
        fill="#F9B4BC"
      />
      <path
        d="M20 140 C56 118, 90 118, 120 132 C148 120, 178 118, 210 136 L210 140 L20 140 Z"
        fill="#BAE6FD"
      />
    </svg>
  )
}
