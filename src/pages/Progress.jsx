import ComingSoon from '../components/ComingSoon'

export default function Progress() {
  return (
    <ComingSoon
      title="Progress Charts"
      description="Mood and stress over the last week, once enough check-ins exist."
      accentClass="bg-white border border-bloom-border"
      todos={[
        'Load moodEntries, including mood and stress values, for the signed-in user.',
        'Render weekly mood and stress charts with Recharts.',
        'Show empty states until the user has logged enough data.',
        'Create Firestore indexes for those queries when enabling this page.',
      ]}
    >
      <div className="mt-6 flex h-40 items-center justify-center rounded-md bg-bloom-bg text-sm text-bloom-muted">
        Chart goes here
      </div>
    </ComingSoon>
  )
}
