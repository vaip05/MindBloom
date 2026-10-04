# MindBloom

A calm mental wellness web app for mood and stress tracking, guided breathing, progress charts, personalized suggestions, and daily browser reminders.

## Stack

- React + Vite
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Recharts
- Browser Notifications API
- Vercel-ready static hosting

## Features

**Live now**
- Create an account, log in, and log out
- Protected dashboard routes
- Home dashboard layout + Profile

**Themed placeholders (see `TODOS.md`)**
- Mood & Stress Tracker
- Breathing Exercises
- Daily Reminders
- Wellness Suggestions
- Progress Charts


## Project structure

```text
src/
  components/   Reusable UI, charts, sidebar, breathing exercise
  context/      Auth provider
  layouts/      Auth and dashboard shells
  lib/          Firebase, constants, notifications, suggestion logic
  pages/        Login, register, and feature screens
  services/     Firestore read/write helpers
```
