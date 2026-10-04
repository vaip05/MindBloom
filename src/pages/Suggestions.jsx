import ComingSoon from '../components/ComingSoon'

export default function Suggestions() {
  return (
    <ComingSoon
      title="Wellness Suggestions"
      description="Show personalized calm tips based on the user’s latest mood and stress check-ins."
      accentClass="bg-bloom-peach-soft"
      todos={[
        'Generate suggestions from recent mood/stress data (see src/lib/suggestions.js).',
        'Persist suggestion snapshots in wellnessSuggestions.',
        'Add a refresh action and empty states when no check-ins exist yet.',
      ]}
    />
  )
}
