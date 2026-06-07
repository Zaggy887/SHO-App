# StrengthHub Online

A professional, mobile-first fitness companion built with **React + TypeScript + Vite + Tailwind CSS**. It reproduces the full StrengthHub Online product experience across five sections, each matching the supplied design mockups.

![Dark theme · lime-green accent](https://img.shields.io/badge/theme-dark-0A0A0B) ![Stack](https://img.shields.io/badge/stack-React%20%7C%20TS%20%7C%20Vite%20%7C%20Tailwind-7ED957)

## Features

The app ships with a bottom tab bar and five fully built sections:

| Section | Tabs | Highlights |
| --- | --- | --- |
| **Dashboard** | — | Greeting, week selector, today's plan, progress overview, habit rings, challenge cards |
| **Workout** | Today · Program · Exercises · History | Live session tracking, checkable exercises, volume/duration/calorie stats, searchable exercise library |
| **Nutrition** | Overview · Diary · Meals · Insights · Education | Calorie ring, macro bars, meal log, breakdown rings, insights & articles |
| **Progress** | — | Quote hero, KPI cards, interactive weight-trend chart (Recharts), 1RM strength gains, habit consistency, streaks |
| **Community** | Feed · Groups · Challenges · Events | Social feed, active challenges with rankings, groups, events |

### Interactivity
- Tab navigation between all five sections and within each section's sub-tabs
- Selectable week-day strip on the Dashboard
- Tap to complete/uncomplete exercises (progress bar updates live)
- Live exercise search
- Interactive weight-trend chart with range toggle and tooltips
- Animated progress rings & bars, screen transitions

## Design system
- **Palette:** near-black surfaces (`ink`), lime-green brand accent (`#7ED957`), plus blue / purple / orange semantic accents
- **Layout:** renders full-bleed on mobile and inside a phone frame on desktop for an authentic app preview
- Reusable primitives in `src/components/ui.tsx` (`ProgressRing`, `ProgressBar`, `SegmentedTabs`, `SectionHeader`, `Chip`, `ScreenHeader`)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to /dist
npm run preview  # preview the production build
```

## Project structure

```
src/
├── App.tsx              # phone shell + screen routing
├── components/
│   ├── BottomNav.tsx    # 5-tab bottom navigation
│   ├── StatusBar.tsx    # faux iOS status bar
│   ├── Avatar.tsx       # initials avatars + stacks
│   ├── Icon.tsx         # name → lucide icon mapper
│   └── ui.tsx           # shared design-system primitives
├── data/
│   └── mockData.ts      # all domain/content data
└── screens/
    ├── Dashboard.tsx
    ├── Workout.tsx
    ├── Nutrition.tsx
    ├── Progress.tsx
    └── Community.tsx
```

## Tech

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 5](https://vite.dev) build tooling
- [Tailwind CSS 3](https://tailwindcss.com) styling
- [lucide-react](https://lucide.dev) icons
- [Recharts](https://recharts.org) charts

> Content is mock data wired through `src/data/mockData.ts` — swap it for a real API to make the app production-live.
