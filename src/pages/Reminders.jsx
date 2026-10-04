import ComingSoon from '../components/ComingSoon'

export default function Reminders() {
  return (
    <ComingSoon
      title="Daily Reminders"
      description="Let users set a daily wellness nudge using the Browser Notifications API."
      accentClass="bg-bloom-yellow-soft"
      todos={[
        'Request notification permission and handle denied/granted states.',
        'Save reminder time + message to the reminders Firestore collection.',
        'Schedule same-day browser notifications while the app tab is open.',
        'Create a reminders index (uid + createdAt) when queries are enabled.',
      ]}
    />
  )
}
