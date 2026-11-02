# MindBloom feature TODOs

Auth, protected routes, Home layout, and Profile are in scope now.
The items below are intentionally left as themed filler pages for future teammates.

## Do not create Firestore indexes yet

Indexes are only needed when a page runs real Firestore queries.
Skip index creation until a teammate enables the matching feature.

---

## Mood & Stress Tracker (`/mood`)

- [x] Save mood and stress check-ins together in each user's `moodEntries` subcollection
- [x] Add validation + success/error messages
- [x] Scope mood queries to `users/{uid}/moodEntries`

## Breath (`/breathe`)

- [ ] Build guided 1-minute breathing exercise UI
- [x] Save completed sessions to `users/{uid}/breathingSessions`
- [x] Scope breathing queries to the signed-in user's subcollection

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

## Sprint 3 — Release readiness
### PBI-033: Add loading, empty, and error states across the application

- Owner: Xuhang Wu
- [x] Distinguish Firestore load failures from successful empty results on Progress, Profile, Suggestions, and Reminders
- [x] Show an explicit first-run empty state when no profile document exists and allow it to be created safely
- [x] Add retry actions for failed data loads
- [x] Show an explicit empty state when suggestions or reminders do not exist yet
- [x] Show breathing-history load errors and retry, and indicate when a completed session is being saved
- [ ] Verify loading, empty, failure, and retry states with a test account and simulated Firestore failures

### PBI-034: Conduct privacy and security testing for user wellness data

- Owner: Xuhang Wu
- [x] Add Firebase Emulator rules tests for unauthenticated access and cross-user isolation
- [x] Validate collection-specific fields, data types, ranges, and immutable identity/session fields
- [x] Cover profile, mood entries, breathing sessions, reminders, suggestions, and unmatched subcollections
- [x] Use generic system-notification text to avoid exposing custom reminder text on lock screens
- [x] Document the privacy/security checks and production-only verification steps in `docs/SPRINT3_PRIVACY_SECURITY.md`
- [x] Run Firestore Emulator rules tests: 8 passed
- [x] Audit production dependencies: `npm audit --omit=dev` reports 0 vulnerabilities
- [ ] With the team, confirm deployed production rules, Firebase authorized domains/API restrictions, App Check, and cross-account behavior

- [ ] Run authenticated UI checks for loading, empty, failure, and retry states with a test account
