import ComingSoon from '../components/ComingSoon'

export default function Reminders() {
  return (
    <ComingSoon
      title="Daily Reminders"
      description="A time and a short message, sent as a browser notification while this tab is open."
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
