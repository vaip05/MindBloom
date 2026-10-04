import ComingSoon from '../components/ComingSoon'
import { FlowerMark } from '../components/BrandLogo'

export default function Breath() {
  return (
    <ComingSoon
      title="Breath"
      description="A one-minute guided breathing exercise with inhale, hold, and exhale cues."
      accentClass="bg-bloom-blue-soft"
      todos={[
        'Build the animated breathing timer UI (about 60 seconds).',
        'Save completed sessions to the breathingSessions Firestore collection.',
        'Show a calm success state when a session finishes.',
      ]}
    >
      <div className="mt-8 flex justify-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80">
          <FlowerMark className="h-16 w-16" />
        </div>
      </div>
    </ComingSoon>
  )
}
