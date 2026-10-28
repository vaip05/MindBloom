export default function MoodFace({ mood, className = 'h-10 w-10' }) {
  if (!mood?.image) return null
  return <img src={mood.image} alt="" className={`shrink-0 object-contain ${className}`} />
}
