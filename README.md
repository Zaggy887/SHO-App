# StrengthHub Online

A fully functional, mobile-first fitness app for **university students** — built with **React + TypeScript + Vite + Tailwind CSS**. Train, eat, track progress and stay accountable with friends, all in one installable PWA.

![Theme](https://img.shields.io/badge/theme-dark%20%2F%20light-0A0A0B) ![Stack](https://img.shields.io/badge/stack-React%20%7C%20TS%20%7C%20Vite%20%7C%20Tailwind-7ED957) ![PWA](https://img.shields.io/badge/PWA-installable%20%26%20offline-7ED957)

## It's actually functional

There's no fake data on screens — everything is driven by a persistent store (`localStorage`) seeded with a realistic **40-day history** for the demo user (*Alex, 21, university student, lean-recomp goal, PPL split*). Stats are computed live, so logging anything updates the whole app.

Out of the box the demo shows: **26 completed workouts**, a **14-day streak** (best 21), bodyweight down **1.4 kg over 4 weeks**, computed 1RM strength gains, 160 logged meals, badges, friends leaderboard and more.

## Features

### Core
- **Onboarding** — goal, experience, days/week & equipment → personalised targets
- **Active workout logger** — set-by-set weight/reps entry, tick-off, **rest timer** (+15s/skip), live volume & duration, finish → saves to history + updates streak
- **Nutrition logging** — searchable food database, **barcode-scan simulation**, budget-meal filter, per-meal logging, diary with remove, live calorie ring & macro bars
- **Weight & habit logging** — quick-add water, steps, sleep, mindset; weight log with trend chart
- **Progress** — interactive weight chart (4/12-week toggle), 1RM strength progression, habit-consistency rings, streaks
- **Community** — working like/bookmark, **create a post** (with photo upload), join groups/challenges, RSVP to events

### Built for students
- **Got 15 minutes?** express, no-equipment dorm workouts
- **Exam Survival Protocol** — toggle a low-stress training mode for exam season
- **Budget nutrition** — cheap, high-protein meal suggestions
- **Friends leaderboard** by university, **badges/streaks** gamification
- **Weekly recap** — shareable "your week in numbers"
- **Progress photos** — private before/after timeline (camera/file upload)

### Platform
- **Light & dark themes** (CSS-variable driven, flips every screen)
- **Units toggle** — kg/lb & L/oz everywhere
- **Notifications centre** with unread badges (+ optional browser notifications)
- **Installable PWA** with offline service worker
- **Reset / clear** demo data from Settings

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the build
```

## Project structure

```
src/
├── App.tsx                 # providers, onboarding gate, tab routing, overlays
├── nav.tsx                 # overlay/navigation context
├── lib/                    # rng, date, unit-format helpers
├── store/
│   ├── types.ts            # domain model
│   ├── seed.ts             # deterministic 40-day history generator
│   ├── store.tsx           # context + reducer + localStorage persistence
│   └── selectors.ts        # live derived stats (streaks, 1RM, nutrition…)
├── data/catalog.ts         # exercises, foods, program, quick workouts
├── components/             # UI primitives, BottomNav, Sheet, Toast, Avatar…
├── overlays/index.tsx      # all secondary flows (settings, logging, recap…)
└── screens/                # Dashboard, Workout, Nutrition, Progress, Community,
                            # Onboarding, ActiveWorkout
```

## Notes for going production-live

The store is fully isolated, so swapping `localStorage` for a real backend (auth + sync) means replacing the persistence layer in `store.tsx` and the seed with API calls. Barcode scanning, wearable sync and push are implemented as functional client-side simulations ready to wire to real services (a camera scanner library, Apple Health / Google Fit, and a push provider).

## Built for students (what sets it apart)

These layers are what make StrengthHub better than the generic tracking and AI apps for a university beginner. All client side, all driven off logged data.

- **Adaptive coaching, not a black box.** After each session the app reads your logged sets and recommends the next weight in one plain sentence ("You hit every rep at 80kg, let's try 82.5kg"). You always stay in control and can override. See `store/training.ts`.
- **Technique confidence.** Every exercise has a cue card: 2 to 3 form cues, the most common beginner mistake, a "what to do if the rack is taken" alternative, and a slot for a looping form clip. Attacks gym anxiety head on.
- **New to the Gym track.** A reassuring first 90 days path: what the machines do, a day one script, gym etiquette, and what a normal first month looks like.
- **Community scoped to belonging.** Campus, hall and society feeds and leaderboards, hall vs hall and society vs society challenges, kudos, PR celebrations, and a campus training partner matcher. Your people, not strangers.
- **Real Exam Mode.** Enter your exam dates and the plan adapts: sessions trim to your key lifts, calories shift toward maintenance, sleep is prioritised and daily targets ease off, then ramp back after.
- **A human coach presence.** A short, warm, rules driven daily check in that celebrates real milestones and adjusts when life happens. No chat window to prompt. See `store/coach.ts`.
- **Real student budget nutrition.** Cheap high protein meals with rough costs, a generated grocery list, and cook once eat three times tips.

## Tech
React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · lucide-react · Recharts
