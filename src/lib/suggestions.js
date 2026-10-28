import { getMoodById, STRESS_LEVELS } from './constants'
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
    {
      title: 'Pass it on',
      body: 'Tell someone one specific thing they did that helped you today.',
      tag: 'Kindness',
    },
    {
      title: 'Mark the moment',
      body: 'Pause for ten seconds and notice where this good feeling sits in your body.',
      tag: 'Awareness',
    },
    {
      title: 'Leave a little light',
      body: 'Set one small plan for tomorrow while this mood is still easy to remember.',
      tag: 'Focus',
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
    {
      title: 'Step into daylight',
      body: 'Stand by a window or go outside for a minute and let your eyes rest on something far away.',
      tag: 'Movement',
    },
    {
      title: 'Keep the thread',
      body: 'Write one sentence about what is going well, so you can find it again later.',
      tag: 'Gratitude',
    },
    {
      title: 'Protect the ease',
      body: 'Choose one thing you will not add to today.',
      tag: 'Rest',
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
    {
      title: 'Change the view',
      body: 'Look out a window, or walk to another room, and name three things you had not noticed.',
      tag: 'Grounding',
    },
    {
      title: 'Unclench',
      body: 'Drop your shoulders, unclench your jaw, and let the next exhale last a little longer.',
      tag: 'Body',
    },
    {
      title: 'One honest line',
      body: 'Write a single sentence about how this moment actually feels.',
      tag: 'Focus',
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
    {
      title: 'Shrink the task',
      body: 'Do only the first thirty seconds of the thing you are avoiding.',
      tag: 'Focus',
    },
    {
      title: 'Ask for a hand',
      body: 'Send one message that says what you need, even if it is just company.',
      tag: 'Connection',
    },
    {
      title: 'Warm something',
      body: 'Hold a warm mug or wash your hands in warm water and stay with that feeling.',
      tag: 'Comfort',
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
    {
      title: 'Stay with one sense',
      body: 'Pick one sound in the room and follow it for five breaths.',
      tag: 'Grounding',
    },
    {
      title: 'Make it smaller',
      body: 'Lie down, dim a light, or step outside. Change one thing about where you are.',
      tag: 'Rest',
    },
    {
      title: 'A later check-in',
      body: 'Look at your recent mood chart and notice you have moved through hard days before.',
      tag: 'Progress',
      action: ACTIONS.progress,
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
    {
      title: 'Notice the room',
      body: 'Name one thing you can see, one you can hear, and one you can feel.',
      tag: 'Grounding',
    },
    {
      title: 'Drink some water',
      body: 'Finish a glass of water before you decide what to do next.',
      tag: 'Body',
    },
    {
      title: 'Pick a time',
      body: 'Choose a time today to come back and log how you feel.',
      tag: 'Focus',
      action: ACTIONS.mood,
    },
  ],
}

const MAX_SUGGESTIONS = 4
// Leave room for at least two tips from the mood library.
const MAX_RULE_SUGGESTIONS = 2
const LIBRARY_PAGE = 3
const HIGH_STRESS = 4
const LOW_STRESS = 2
const LOW_MOOD = 2

function exerciseName(id) {
  return getExerciseById(id)?.name || 'a breathing exercise'
}

function moodValueOf(entry) {
  return entry.moodValue ?? getMoodById(entry.moodId)?.value
}

function becauseMood({ mood, stressLevel }) {
  const stress = STRESS_LEVELS.find((level) => level.value === Number(stressLevel))
  if (mood && stress) {
    return `Shown because your latest mood is ${mood.label} and stress is ${stress.label.toLowerCase()}.`
  }
  if (mood) return `Shown because your latest mood is ${mood.label}.`
  return 'Shown because you have not logged a mood yet.'
}

const RULE_REASONS = {
  'stress-pattern': 'Shown because several recent check-ins had high stress.',
  'stress-high': 'Shown because your latest stress is high.',
  'low-mood-streak': 'Shown because your last few moods have felt heavy.',
  'mood-rising': 'Shown because your mood is higher than your recent average.',
  'evening-wind-down': 'Shown because it is late and you seem unsettled.',
  'breathe-nudge': 'Shown because you have not done a breathing exercise this week.',
  'stress-low': 'Shown because your stress is low right now.',
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
  page = 0,
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
      suggestions.push({
        ...suggestion,
        reason: suggestion.reason || RULE_REASONS[suggestion.id] || becauseMood(context),
      })
      usedGroups.add(rule.group)
    }
  }

  const usedTags = new Set(suggestions.map((item) => item.tag))
  const base = LIBRARY[moodId] || LIBRARY.default
  const pageCount = Math.max(1, Math.ceil(base.length / LIBRARY_PAGE))
  const start = (Math.abs(page) % pageCount) * LIBRARY_PAGE
  for (let index = start; index < start + LIBRARY_PAGE; index += 1) {
    const item = base[index]
    if (!item || suggestions.length >= MAX_SUGGESTIONS || usedTags.has(item.tag)) continue
    suggestions.push({
      id: `${moodId || 'default'}-${index}`,
      ...item,
      reason: item.reason || becauseMood(context),
    })
    usedTags.add(item.tag)
  }

  suggestions.push({
    id: 'journal',
    title: 'Write it in the notebook',
    body: 'Open a page and put down what this mood feels like. Saved pages stay in Journaling.',
    tag: 'Journal',
    reason: context.mood
      ? `Shown because writing can make this ${context.mood.label} mood easier to see.`
      : 'Shown because a few written lines can make the day easier to see.',
    action: { type: 'journal', label: 'Open notebook' },
  })

  return suggestions
}
