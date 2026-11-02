# Sprint 3 — Privacy and security verification

## Automated Firestore rules checks

Run `npm run test:security`. The suite starts the local Firestore Emulator and verifies that:

- Unauthenticated clients cannot read or write user profile or wellness data.
- An authenticated user can access their own records but cannot read, list, or write another user's records.
- The same isolation applies to mood entries, breathing sessions, reminders, and wellness suggestions.
- Unmatched user subcollections are denied by default.

These tests exercise the rules file in this repository against the Emulator. They do not prove that the same rules have been deployed to the production Firebase project.

## Privacy checks implemented

- Mood, breathing, reminder, and suggestion records are stored below `users/{uid}` and guarded by the authenticated UID in `firestore.rules`.
- Rules validate collection-specific field allowlists, types, and value limits; user identity fields are tied to the path UID, and breathing updates are restricted to the session feedback marker.
- Browser reminders use a generic notification body so custom reminder text is not exposed on lock screens or shared-device notification surfaces.
- Firebase client configuration is read from environment variables; never place Admin SDK credentials or private keys in browser environment variables.

## Production/manual verification still required

- In Firebase Console, confirm the deployed Firestore rules match the tested rules and inspect Authentication authorized domains.
- Test two separate accounts against the production project: each account must be unable to read the other's profile, mood notes, breathing history, reminders, or suggestions.
- Confirm the team's API-key restrictions and App Check configuration. App Check is additional abuse protection, not a replacement for Firestore rules.
- Confirm production environment variables contain only client configuration, and verify no wellness data or credentials are emitted to browser/server logs.
- Document retention/deletion expectations with the team before claiming full privacy compliance; this repository does not yet implement account-data export or deletion.

## Local test result

- `npm run test:security`: 8 Firestore Emulator rules tests passed.
- `npm audit --omit=dev`: 0 production dependency vulnerabilities reported.
- The complete dependency tree still contains development-tool audit findings; review `npm audit` output before changing Firebase tooling versions because forced updates propose breaking downgrades.