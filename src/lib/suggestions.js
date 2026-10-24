import { getMoodById } from './constants'
import { getExerciseById } from './breathingExercises'

const ACTIONS = {
  breathe: { label: 'Start a breathing exercise', to: '/breathe' },
  mood: { label: 'Log a check-in', to: '/mood' },
  reminders: { label: 'Set a reminder', to: '/reminders' },
  progress: { label: 'View your progress', to: '/progress' },
}

const LIBRARY = {
  great: [
    {
      title: 'Savor the good',
      body: 'Write down one thing that made today feel bright and revisit it tonight.',
      tag: 'Gratitude',
    },
    {
      title: 'Share the warmth',
      body: 'Send a short kind message to someone who lifts you up.',
      tag: 'Connection',
    },
    {
      title: 'Keep the momentum',
      body: 'Take a short walk outdoors to lock in this positive energy.',
      tag: 'Movement',
    },
  ],
  good: [
    {
      title: 'Gentle stretch',
      body: 'Spend two minutes rolling your shoulders and loosening your jaw.',
      tag: 'Body',
    },
    {
      title: 'Mindful sip',
      body: 'Make a warm drink and notice the aroma, taste, and warmth with each sip.',
      tag: 'Mindfulness',
    },
    {
      title: 'One small win',
      body: 'Finish one tiny task you have been putting off to boost your sense of ease.',
      tag: 'Focus',
    },
  ],
  okay: [
    {
      title: 'Reset with breath',
      body: 'Try a one-minute breathing exercise to clear a little mental fog.',
      tag: 'Breath',
      action: ACTIONS.breathe,
    },
    {
      title: 'Soften your space',
      body: 'Tidy one small surface nearby — a clearer space can settle a busy mind.',
      tag: 'Environment',
    },
    {
      title: 'Name the feeling',
      body: 'Quietly name what you are feeling without judging it. Naming often softens intensity.',
      tag: 'Awareness',
    },
  ],
  'not-great': [
    {
      title: 'Lower the load',
      body: 'Choose the smallest next step for your hardest task — progress over perfection.',
      tag: 'Support',
    },
    {
      title: 'Ground yourself',
      body: 'Notice five things you can see, four you can touch, and three you can hear.',
      tag: 'Grounding',
    },
    {
      title: 'Kind pause',
      body: 'Step away from screens for a few minutes and place a hand on your chest.',
      tag: 'Rest',
    },
  ],
  tough: [
    {
      title: 'You are not alone',
      body: 'Reach out to a trusted person, or use a breathing exercise to create a little space.',
      tag: 'Care',
      action: ACTIONS.breathe,
    },
    {
      title: 'Comfort first',
      body: 'Drink water, get fresh air, or wrap yourself in something soft. Basic care counts.',
      tag: 'Comfort',
    },
    {
      title: 'Soft landing',
      body: 'Set a gentle reminder later today to check in with yourself again.',
      tag: 'Safety',
      action: ACTIONS.reminders,
    },
  ],
  default: [
    {
      title: 'Start with a check-in',
      body: 'Log your mood to unlock suggestions tailored to how you feel today.',
      tag: 'Start',
      action: ACTIONS.mood,
    },
    {
      title: 'Breathe for a minute',
      body: 'A short breathing session can help you feel more centered anytime.',
      tag: 'Breath',
      action: ACTIONS.breathe,
    },
    {
      title: 'Set a reminder',
      body: 'Schedule a daily wellness nudge so calm stays on your calendar.',
      tag: 'Reminder',
      action: ACTIONS.reminders,
    },
  ],
}

const MAX_SUGGESTIONS = 4
// Leave room for at least two tips from the mood library.
const MAX_RULE_SUGGESTIONS = 2
const HIGH_STRESS = 4
const LOW_STRESS = 2
const LOW_MOOD = 2

function exerciseName(id) {
  return getExerciseById(id)?.name || 'a breathing exercise'
}

function moodValueOf(entry) {
  return entry.moodValue ?? getMoodById(entry.moodId)?.value
}

/**
 * Personalized rules, highest priority first. Each one looks at the user's
 * data and returns a suggestion, or null when it does not apply.
 * Rules in the same `group` cover the same topic, so only the first match is kept.
 */
const RULES = [
  {
    group: 'stress',
    match: ({ recentEntries }) => {
      const stressful = recentEntries.filter((entry) => entry.stressLevel >= HIGH_STRESS).length
      if (stressful < 3) return null
      return {
        id: 'stress-pattern',
        title: 'Stress keeps showing up',
        body: `${stressful} of your recent check-ins had high stress. A daily ${exerciseName('box')} session can give your week a steady reset.`,
        tag: 'Stress',
        action: ACTIONS.breathe,
      }
    },
  },
  {
    group: 'stress',
    match: ({ stressLevel }) =>
      stressLevel >= HIGH_STRESS
        ? {
            id: 'stress-high',
            title: 'Ease the pressure',
            body: `Your stress looks elevated. Try ${exerciseName('box')} or a short break before the next task.`,
            tag: 'Stress',
            action: ACTIONS.breathe,
          }
        : null,
  },
  {
    group: 'mood',
    match: ({ recentEntries }) => {
      const lastThree = recentEntries.slice(-3)
      if (lastThree.length < 3 || !lastThree.every((entry) => moodValueOf(entry) <= LOW_MOOD)) {
        return null
      }
      return {
        id: 'low-mood-streak',
        title: 'Be gentle with yourself',
        body: 'Your last few check-ins have felt heavy. Consider reaching out to someone you trust. You do not have to carry it alone.',
        tag: 'Care',
      }
    },
  },
  {
    group: 'mood',
    match: ({ recentEntries }) => {
      if (recentEntries.length < 3) return null
      const values = recentEntries.map(moodValueOf).filter(Boolean)
      const latest = values.at(-1)
      const earlier = values.slice(0, -1)
      const average = earlier.reduce((sum, value) => sum + value, 0) / earlier.length
      if (!latest || latest - average < 1) return null
      return {
        id: 'mood-rising',
        title: 'Things are looking up',
        body: 'Your mood is higher than your recent average. Notice what helped and keep it in your routine.',
        tag: 'Progress',
        action: ACTIONS.progress,
      }
    },
  },
  {
    group: 'time',
    match: ({ mood, stressLevel, now }) => {
      const evening = now.getHours() >= 20
      const unsettled = stressLevel >= 3 || (mood && mood.value <= 3)
      if (!evening || !unsettled) return null
      return {
        id: 'evening-wind-down',
        title: 'Wind down for sleep',
        body: `${exerciseName('4-7-8')} uses a long, slow exhale that can help you settle before bed.`,
        tag: 'Sleep',
        action: ACTIONS.breathe,
      }
    },
  },
  {
    group: 'breath',
    // Only runs when breathing history was passed in; null means "unknown", not "none".
    match: ({ breathingSessions }) =>
      Array.isArray(breathingSessions) && breathingSessions.length === 0
        ? {
            id: 'breathe-nudge',
            title: 'Make room for a breath',
            body: `You have not done a breathing exercise this week. ${exerciseName('coherent')} takes about a minute.`,
            tag: 'Breath',
            action: ACTIONS.breathe,
          }
        : null,
  },
  {
    group: 'stress',
    match: ({ stressLevel, mood }) =>
      stressLevel && stressLevel <= LOW_STRESS && mood
        ? {
            id: 'stress-low',
            title: 'Protect this calm',
            body: 'Stress is low right now. Keep a light routine and notice what is helping.',
            tag: 'Balance',
          }
        : null,
  },
]

/**
 * Builds up to four suggestions: personalized rule matches first, then tips
 * for the latest mood.
 *
 * moodId, stressLevel: the latest check-in.
 * recentEntries (optional): mood entries from the last week, oldest first.
 * breathingSessions (optional): sessions from the last week. Leave it out if unknown.
 */
export function buildSuggestions({
  moodId,
  stressLevel,
  recentEntries = [],
  breathingSessions = null,
  now = new Date(),
}) {
  const context = {
    mood: getMoodById(moodId),
    stressLevel,
    recentEntries,
    breathingSessions,
    now,
  }

  const suggestions = []
  const usedGroups = new Set()
  for (const rule of RULES) {
    if (suggestions.length >= MAX_RULE_SUGGESTIONS) break
    if (usedGroups.has(rule.group)) continue
    const suggestion = rule.match(context)
    if (suggestion) {
      suggestions.push(suggestion)
      usedGroups.add(rule.group)
    }
  }

  const usedTags = new Set(suggestions.map((item) => item.tag))
  const base = LIBRARY[moodId] || LIBRARY.default
  base.forEach((item, index) => {
    if (suggestions.length >= MAX_SUGGESTIONS || usedTags.has(item.tag)) return
    suggestions.push({ id: `${moodId || 'default'}-${index}`, ...item })
  })

  return suggestions
}
