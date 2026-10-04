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
- Breath
- Daily Reminders
- Wellness Suggestions
- Progress Charts

No journal feature is included.

Do **not** create Firestore composite indexes until a teammate enables the matching feature queries.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project.
2. Enable **Email/Password** authentication.
3. Create a Cloud Firestore database.
4. Deploy the security rules in `firestore.rules`.
5. Create the composite indexes in `firestore.indexes.json` (or accept the index links from the browser console when queries first run).
6. Copy `.env.example` to `.env` and fill in your web app config:

```bash
cp .env.example .env
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build

```bash
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add the same `VITE_FIREBASE_*` environment variables.
4. Deploy. `vercel.json` already rewrites routes for client-side routing.

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

## Design notes

The UI follows the attached MindBloom mockups: off-white background, dark navy text, soft pastels, rounded sections, and a simple sidebar layout. Login and Home are the primary visual references; other pages reuse the same system without crowding the interface.
