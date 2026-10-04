export default function DecorativePetals({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="absolute bottom-[-3rem] left-[-2rem] h-40 w-40 rounded-[55%] bg-bloom-pink/70 blur-[1px]" />
      <div className="absolute bottom-[-1rem] left-10 h-36 w-36 rounded-[55%] bg-bloom-yellow/80" />
      <div className="absolute bottom-8 left-[-1rem] h-32 w-32 rounded-[55%] bg-bloom-green/70" />
      <div className="absolute bottom-[-0.5rem] left-24 h-28 w-28 rounded-[55%] bg-[#c4b5fd]/80" />
    </div>
  )
}
