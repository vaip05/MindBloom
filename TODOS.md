# MindBloom feature TODOs

Auth, protected routes, Home layout, and Profile are in scope now.
The items below are intentionally left as themed filler pages for future teammates.

## Do not create Firestore indexes yet

Indexes are only needed when a page runs real Firestore queries.
Skip index creation until a teammate enables the matching feature.

---

## Mood & Stress Tracker (`/mood`)

- [ ] Save mood check-ins to `moodEntries`
- [ ] Save stress levels to `stressEntries`
- [ ] Add validation + success/error messages
- [ ] Create composite index: `uid` + `createdAt` (when queries are enabled)

## Breath (`/breathe`)

- [ ] Build guided 1-minute breathing exercise UI
- [ ] Save completed sessions to `breathingSessions`
- [ ] Create composite index: `uid` + `createdAt` (when queries are enabled)

## Daily Reminders (`/reminders`)

- [ ] Request Browser Notification permission
- [ ] Save reminder settings to `reminders`
- [ ] Schedule same-day notifications
- [ ] Create composite index: `uid` + `createdAt` (when queries are enabled)

## Wellness Suggestions (`/suggestions`)

- [ ] Personalize suggestions from latest mood/stress
- [ ] Store snapshots in `wellnessSuggestions`
- [ ] Reuse helpers in `src/lib/suggestions.js` and `src/services/firestoreServices.js`

## Progress Charts (`/progress`)

- [ ] Fetch weekly mood + stress history
- [ ] Render Recharts mood/stress charts
- [ ] Handle empty states

## Home dashboard polish

- [ ] Re-enable live daily check-in once Mood & Stress is implemented
- [ ] Re-enable live weekly mood chart once Progress Charts is implemented
- [ ] Link “Start breathing” to a working Breath session

## Helpful starter files already in the repo

- `src/services/firestoreServices.js`
- `src/lib/suggestions.js`
- `src/lib/notifications.js`
- `src/components/MoodSelector.jsx`
- `src/components/MoodChart.jsx`
- `src/components/StressChart.jsx`
- `src/components/BreathingExercise.jsx`
- `firestore.rules`
- `firestore.indexes.json`
