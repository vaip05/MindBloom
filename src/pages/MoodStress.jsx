import ComingSoon from '../components/ComingSoon'
import MoodSelector from '../components/MoodSelector'

export default function MoodStress() {
  return (
    <ComingSoon
      title="Mood & Stress Tracker"
      description="Track daily mood and stress levels, then store them in Firestore for progress charts and suggestions."
      accentClass="bg-bloom-pink-soft"
      todos={[
        'Wire MoodSelector and a stress slider to Firestore (moodEntries / stressEntries).',
        'Add form validation and clear success/error messages.',
        'Refresh wellness suggestions after each check-in.',
        'Create Firestore composite indexes for uid + createdAt when queries are enabled.',
      ]}
    >
      <div className="mt-6 pointer-events-none opacity-70">
        <MoodSelector value="" onChange={() => {}} />
      </div>
    </ComingSoon>
  )
}
