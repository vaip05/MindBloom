/**
 * Firestore helpers for future feature work.
 *
 * Currently used by auth/profile flows. Mood, stress, breathing, reminders,
 * suggestions, and progress queries are scaffolded here but not wired into
 * active pages yet — see TODOS.md.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  limit,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import { DEFAULT_AVATAR } from '../lib/constants'
import { buildSuggestions } from '../lib/suggestions'

function requireDb() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      'Firebase is not configured. Add your keys to a .env file (see .env.example).',
    )
  }
  return db
}

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n) {
  const d = startOfDay()
  d.setDate(d.getDate() - n)
  return d
}

function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  return new Date(value)
}

function withinDays(entry, days) {
  const created = toDate(entry.createdAt) || toDate(entry.localDate)
  if (!created) return false
  return created >= daysAgo(days)
}

export async function ensureUserProfile(user, extras = {}) {
  const database = requireDb()
  const ref = doc(database, 'users', user.uid)
  const snap = await getDoc(ref)
  const payload = {
    uid: user.uid,
    email: user.email || '',
    displayName: extras.displayName || user.displayName || '',
    updatedAt: serverTimestamp(),
  }

  if (!snap.exists()) {
    await setDoc(ref, {
      ...payload,
      avatarEmoji: extras.avatarEmoji || DEFAULT_AVATAR,
      bio: extras.bio || '',
      createdAt: serverTimestamp(),
      reminderDefaults: {
        enabled: false,
        time: '09:00',
        message: 'Take a moment for yourself.',
      },
    })
  } else {
    await setDoc(ref, payload, { merge: true })
  }

  return (await getDoc(ref)).data()
}

export async function getUserProfile(uid) {
  const database = requireDb()
  const snap = await getDoc(doc(database, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(uid, data) {
  const database = requireDb()
  await updateDoc(doc(database, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function saveMoodEntry(uid, { moodId, moodValue, note = '' }) {
  const database = requireDb()
  const entry = {
    uid,
    moodId,
    moodValue,
    note,
    createdAt: serverTimestamp(),
    localDate: startOfDay().toISOString(),
  }
  const ref = await addDoc(collection(database, 'moodEntries'), entry)
  await refreshSuggestions(uid)
  return { id: ref.id, ...entry }
}

export async function saveStressEntry(uid, { stressLevel, note = '' }) {
  const database = requireDb()
  const entry = {
    uid,
    stressLevel,
    note,
    createdAt: serverTimestamp(),
    localDate: startOfDay().toISOString(),
  }
  const ref = await addDoc(collection(database, 'stressEntries'), entry)
  await refreshSuggestions(uid)
  return { id: ref.id, ...entry }
}

export async function saveBreathingSession(uid, { durationSeconds, completed }) {
  const database = requireDb()
  const entry = {
    uid,
    durationSeconds,
    completed,
    createdAt: serverTimestamp(),
  }
  const ref = await addDoc(collection(database, 'breathingSessions'), entry)
  return { id: ref.id, ...entry }
}

async function listByUser(collectionName, uid, max = 60) {
  const database = requireDb()
  const q = query(
    collection(database, collectionName),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(max),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getRecentMoodEntries(uid, days = 7) {
  const entries = await listByUser('moodEntries', uid)
  return entries.filter((entry) => withinDays(entry, days)).reverse()
}

export async function getRecentStressEntries(uid, days = 7) {
  const entries = await listByUser('stressEntries', uid)
  return entries.filter((entry) => withinDays(entry, days)).reverse()
}

export async function getLatestMood(uid) {
  const entries = await listByUser('moodEntries', uid, 1)
  return entries[0] || null
}

export async function getLatestStress(uid) {
  const entries = await listByUser('stressEntries', uid, 1)
  return entries[0] || null
}

export async function getBreathingSessions(uid, days = 30) {
  const entries = await listByUser('breathingSessions', uid)
  return entries.filter((entry) => withinDays(entry, days))
}

export async function saveReminder(uid, reminder) {
  const database = requireDb()
  const payload = {
    uid,
    enabled: Boolean(reminder.enabled),
    time: reminder.time,
    message: reminder.message || 'Take a moment for yourself.',
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }

  if (reminder.id) {
    const ref = doc(database, 'reminders', reminder.id)
    await updateDoc(ref, {
      enabled: payload.enabled,
      time: payload.time,
      message: payload.message,
      updatedAt: serverTimestamp(),
    })
    return { id: reminder.id, ...payload }
  }

  const ref = await addDoc(collection(database, 'reminders'), payload)
  return { id: ref.id, ...payload }
}

export async function getReminders(uid) {
  return listByUser('reminders', uid, 20)
}

export async function refreshSuggestions(uid) {
  const database = requireDb()
  const [mood, stress] = await Promise.all([getLatestMood(uid), getLatestStress(uid)])
  const suggestions = buildSuggestions({
    moodId: mood?.moodId,
    stressLevel: stress?.stressLevel,
  })

  const ref = doc(database, 'wellnessSuggestions', uid)
  await setDoc(ref, {
    uid,
    suggestions,
    basedOnMood: mood?.moodId || null,
    basedOnStress: stress?.stressLevel || null,
    updatedAt: serverTimestamp(),
  })

  return suggestions
}

export async function getSuggestions(uid) {
  const database = requireDb()
  const snap = await getDoc(doc(database, 'wellnessSuggestions', uid))
  if (!snap.exists()) {
    return refreshSuggestions(uid)
  }
  return snap.data().suggestions || []
}
