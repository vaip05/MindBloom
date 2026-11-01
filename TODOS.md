# MindBloom feature TODOs

This document tracks implemented features and the remaining release work.

## Firestore indexes

The Progress page now runs real Firestore history queries. Confirm the required indexes are deployed to the production Firebase project before release.

---

## Mood & Stress Tracker (`/mood`)

- [x] Save mood and stress check-ins together in each user's `moodEntries` subcollection
- [x] Add validation + success/error messages
- [x] Scope mood queries to `users/{uid}/moodEntries`

## Breath (`/breathe`)

- [x] Build guided breathing exercise UI
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

- [x] Fetch weekly mood + stress history
- [x] Render Recharts mood/stress charts
- [x] Handle empty states

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

### PBI-035: Final bug-fixing and quality-assurance pass

- Priority: High
- Owner: Xuhang Wu
- Estimate: 8 points
- [x] Run production build and lint; resolve blocking errors
- [x] Verify login and registration screens render locally
- [x] Verify an unauthenticated direct visit to `/progress` redirects to login
- [ ] Test successful authentication, mood check-in, progress history, and logout with an authorized test account
- [ ] Fix and retest high-priority defects
- [ ] Record test results and any accepted known issues

### PBI-036: Deploy and test the production version

- Priority: High
- Owner: Xuhang Wu
- Estimate: 6 points
- Deployment is currently blocked: Vercel CLI and a linked team project are not configured in this workspace.
- [ ] Deploy the production build to the team hosting project
- [ ] Confirm the production URL loads and client-side routes work after refresh
- [ ] Verify production Firebase configuration, authentication, Firestore rules, and required indexes
- [ ] Smoke-test the main user journeys in production and record the results
