import { readFile } from 'node:fs/promises'
import { after, before, beforeEach, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const projectId = 'demo-mindbloom-security'
let testEnvironment

before(async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  })
})

beforeEach(async () => {
  await testEnvironment.clearFirestore()
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore()
    await setDoc(doc(database, 'users/alice'), { uid: 'alice', displayName: 'Alice' })
    await setDoc(doc(database, 'users/alice/moodEntries/mood-1'), { moodId: 'good', note: 'private' })
    await setDoc(doc(database, 'users/alice/breathingSessions/session-1'), { exerciseType: 'box-breathing' })
    await setDoc(doc(database, 'users/alice/reminders/reminder-1'), { uid: 'alice', message: 'private reminder' })
    await setDoc(doc(database, 'users/alice/wellnessSuggestions/current'), { uid: 'alice', suggestions: [] })
  })
})

after(async () => {
  await testEnvironment.cleanup()
})

test('unauthenticated clients cannot read or write wellness data', async () => {
  const database = testEnvironment.unauthenticatedContext().firestore()

  await assertFails(getDoc(doc(database, 'users/alice')))
  await assertFails(getDoc(doc(database, 'users/alice/moodEntries/mood-1')))
  await assertFails(setDoc(doc(database, 'users/alice/moodEntries/new-entry'), { moodId: 'good' }))
})

test('an authenticated user can read and write only their own wellness data', async () => {
  const alice = testEnvironment.authenticatedContext('alice').firestore()
  const bob = testEnvironment.authenticatedContext('bob').firestore()

  await assertSucceeds(getDoc(doc(alice, 'users/alice')))
  await assertSucceeds(getDocs(collection(alice, 'users/alice/moodEntries')))
  await assertSucceeds(setDoc(doc(alice, 'users/alice/moodEntries/new-entry'), {
    moodId: 'good',
    moodValue: 4,
    stressLevel: 2,
    note: 'Feeling okay',
    createdAt: new Date(),
    localDate: new Date().toISOString(),
  }))

  await assertFails(getDoc(doc(bob, 'users/alice')))
  await assertFails(getDoc(doc(bob, 'users/alice/moodEntries/mood-1')))
  await assertFails(getDocs(collection(bob, 'users/alice/moodEntries')))
  await assertFails(setDoc(doc(bob, 'users/alice/moodEntries/attack'), { moodId: 'bad' }))
})

test('owner isolation applies to breathing, reminders, and suggestion records too', async () => {
  const bob = testEnvironment.authenticatedContext('bob').firestore()
  const protectedPaths = [
    'users/alice/breathingSessions/session-1',
    'users/alice/reminders/reminder-1',
    'users/alice/wellnessSuggestions/current',
  ]

  await Promise.all(protectedPaths.map((path) => assertFails(getDoc(doc(bob, path)))) )
})

test('unmatched user subcollections remain denied by default', async () => {
  const alice = testEnvironment.authenticatedContext('alice').firestore()

  await assertFails(getDoc(doc(alice, 'users/alice/privateExports/export-1')))
})

test('owners cannot write malformed mood records or change profile identity fields', async () => {
  const alice = testEnvironment.authenticatedContext('alice').firestore()

  await assertFails(setDoc(doc(alice, 'users/alice'), {
    uid: 'bob',
    email: 'alice@example.com',
    displayName: 'Alice',
  }, { merge: true }))

  await assertFails(setDoc(doc(alice, 'users/alice/moodEntries/invalid'), {
    moodId: 'unknown',
    moodValue: 9,
    stressLevel: 99,
    note: 'out of range',
    createdAt: new Date(),
    localDate: new Date().toISOString(),
    privateUnexpectedField: 'must be rejected',
  }))
})

test('owners cannot create invalid reminders or suggestions for another user', async () => {
  const alice = testEnvironment.authenticatedContext('alice').firestore()

  await assertFails(setDoc(doc(alice, 'users/alice/reminders/invalid'), {
    uid: 'bob',
    enabled: true,
    time: '25:99',
    message: 'x'.repeat(161),
  }))

  await assertFails(setDoc(doc(alice, 'users/alice/wellnessSuggestions/invalid'), {
    uid: 'bob',
    suggestions: [],
    basedOnMood: 'unknown',
    basedOnStress: 8,
  }))
})

test('owners can write valid reminder, suggestion, breathing, and profile data', async () => {
  const alice = testEnvironment.authenticatedContext('alice').firestore()

  await assertSucceeds(setDoc(doc(alice, 'users/alice'), {
    uid: 'alice',
    email: 'alice@example.com',
    displayName: 'Alice Updated',
    avatarEmoji: '🌸',
    bio: 'A short profile note',
  }, { merge: true }))

  await assertSucceeds(setDoc(doc(alice, 'users/alice/reminders/new-reminder'), {
    uid: 'alice',
    enabled: true,
    time: '09:30',
    message: 'A private reminder',
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  await assertSucceeds(setDoc(doc(alice, 'users/alice/wellnessSuggestions/current'), {
    uid: 'alice',
    suggestions: [{ id: 'tip-1', title: 'Take a break' }],
    basedOnMood: 'good',
    basedOnStress: 2,
    updatedAt: new Date(),
  }))

  const sessionRef = doc(alice, 'users/alice/breathingSessions/new-session')
  await assertSucceeds(setDoc(sessionRef, {
    exerciseType: 'box',
    durationSeconds: 64,
    cyclesCompleted: 4,
    completed: true,
    completedAt: new Date(),
    createdAt: new Date(),
  }))
  await assertSucceeds(setDoc(sessionRef, { goodSession: true, updatedAt: new Date() }, { merge: true }))
})

test('breathing updates may only change the good-session marker', async () => {
  const alice = testEnvironment.authenticatedContext('alice').firestore()
  const sessionRef = doc(alice, 'users/alice/breathingSessions/session-1')

  await assertFails(setDoc(sessionRef, { exerciseType: 'altered' }, { merge: true }))
})