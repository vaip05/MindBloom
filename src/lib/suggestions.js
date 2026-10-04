import { getMoodById } from './constants'

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
    },
  ],
  default: [
    {
      title: 'Start with a check-in',
      body: 'Log your mood to unlock suggestions tailored to how you feel today.',
      tag: 'Start',
    },
    {
      title: 'Breathe for a minute',
      body: 'A short breathing session can help you feel more centered anytime.',
      tag: 'Breath',
    },
    {
      title: 'Set a reminder',
      body: 'Schedule a daily wellness nudge so calm stays on your calendar.',
      tag: 'Reminder',
    },
  ],
}

export function buildSuggestions({ moodId, stressLevel }) {
  const mood = getMoodById(moodId)
  const base = LIBRARY[moodId] || LIBRARY.default
  const suggestions = base.map((item, index) => ({
    id: `${moodId || 'default'}-${index}`,
    ...item,
  }))

  if (stressLevel >= 4) {
    suggestions.unshift({
      id: 'stress-high',
      title: 'Ease the pressure',
      body: 'Your stress looks elevated. Try slow breathing or a short break before the next task.',
      tag: 'Stress',
    })
  } else if (stressLevel && stressLevel <= 2 && mood) {
    suggestions.unshift({
      id: 'stress-low',
      title: 'Protect this calm',
      body: 'Stress is low right now. Keep a light routine and notice what is helping.',
      tag: 'Balance',
    })
  }

  return suggestions.slice(0, 4)
}
