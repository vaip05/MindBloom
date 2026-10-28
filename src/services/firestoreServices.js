/**
 * Firestore helpers for the authenticated user's profile and wellness data.
 * Wellness records are stored in subcollections under users/{uid} so that
 * every read and write is scoped to the signed-in user's document path.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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

function userCollection(database, uid, collectionName) {
  return collection(database, 'users', uid, collectionName)
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

export async function saveMoodEntry(uid, { moodId, moodValue, stressLevel, note = '' }) {
  const database = requireDb()
  const entry = {
    moodId,
    moodValue,
    stressLevel: Number(stressLevel),
    note,
    createdAt: serverTimestamp(),
    localDate: startOfDay().toISOString(),
  }
  const ref = await addDoc(userCollection(database, uid, 'moodEntries'), entry)
  await refreshSuggestions(uid)
  return { id: ref.id, ...entry }
}

export async function saveBreathingSession(uid, {
  exerciseType,
  durationSeconds,
  cyclesCompleted,
  completed = true,
}) {
  const database = requireDb()
  const entry = {
    exerciseType,
    durationSeconds,
    cyclesCompleted,
    completed,
    completedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }
  const ref = await addDoc(userCollection(database, uid, 'breathingSessions'), entry)
  return { id: ref.id, ...entry }
}

export async function updateBreathingSession(uid, sessionId, data) {
  const database = requireDb()
  await updateDoc(doc(database, 'users', uid, 'breathingSessions', sessionId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

async function listByUser(collectionName, uid, max = 60) {
  const database = requireDb()
  const q = query(
    userCollection(database, uid, collectionName),
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
  const entries = await listByUser('moodEntries', uid)
  return entries.filter((entry) => entry.stressLevel != null && withinDays(entry, days)).reverse()
}

export async function getLatestMood(uid) {
  const entries = await listByUser('moodEntries', uid, 1)
  return entries[0] || null
}

export async function getLatestStress(uid) {
  const entries = await listByUser('moodEntries', uid)
  return entries.find((entry) => entry.stressLevel != null) || null
}

export async function getBreathingSessions(uid, days = 30) {
  const database = requireDb()
  const q = query(
    userCollection(database, uid, 'breathingSessions'),
    orderBy('completedAt', 'desc'),
    limit(20),
  )
  const snap = await getDocs(q)
  const cutoff = daysAgo(days)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((entry) => {
      if (entry.completed === false) return false
      const completedAt = toDate(entry.completedAt) || toDate(entry.createdAt)
      return completedAt != null && completedAt >= cutoff
    })
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
    const ref = doc(database, 'users', uid, 'reminders', reminder.id)
    await updateDoc(ref, {
      enabled: payload.enabled,
      time: payload.time,
      message: payload.message,
      updatedAt: serverTimestamp(),
    })
    return { id: reminder.id, ...payload }
  }

  const ref = await addDoc(userCollection(database, uid, 'reminders'), payload)
  return { id: ref.id, ...payload }
}

export async function getReminders(uid) {
  return listByUser('reminders', uid, 20)
}

export async function refreshSuggestions(uid) {
  const database = requireDb()
  const ref = doc(database, 'users', uid, 'wellnessSuggestions', 'current')
  const [mood, stress, currentSnap] = await Promise.all([
    getLatestMood(uid),
    getLatestStress(uid),
    getDoc(ref),
  ])
  const page = (currentSnap.data()?.page ?? 0) + 1
  const suggestions = buildSuggestions({
    moodId: mood?.moodId,
    stressLevel: stress?.stressLevel,
    page,
  })

  await setDoc(ref, {
    uid,
    suggestions,
    page,
    basedOnMood: mood?.moodId || null,
    basedOnStress: stress?.stressLevel ?? null,
    updatedAt: serverTimestamp(),
  })

  return suggestions
}

export async function saveJournalEntry(uid, { id, title, body, kind = 'free', prompt = '' }) {
  const database = requireDb()
  const trimmedPrompt = prompt.trim()
  const payload = {
    title:
      title.trim() ||
      (kind === 'prompt' ? trimmedPrompt.slice(0, 80) : '') ||
      (kind === 'suggestion' ? 'From suggestions' : 'Untitled'),
    body: body.trim(),
    kind,
    updatedAt: serverTimestamp(),
  }
  if (kind === 'prompt' && trimmedPrompt) payload.prompt = trimmedPrompt
  if (id) {
    await updateDoc(doc(database, 'users', uid, 'journalEntries', id), payload)
    return { id, ...payload }
  }
  const ref = await addDoc(userCollection(database, uid, 'journalEntries'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...payload }
}

export async function getJournalEntries(uid) {
  return listByUser('journalEntries', uid, 40)
}

export async function deleteJournalEntry(uid, entryId) {
  await deleteDoc(doc(requireDb(), 'users', uid, 'journalEntries', entryId))
}

export async function getSuggestions(uid) {
  const database = requireDb()
  const snap = await getDoc(doc(database, 'users', uid, 'wellnessSuggestions', 'current'))
  if (!snap.exists()) {
    return refreshSuggestions(uid)
  }
  return snap.data().suggestions || []
}
