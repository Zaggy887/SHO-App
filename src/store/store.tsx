import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { todayKey } from '../lib/date'
import { buildSeed, emptyState, SCHEMA_VERSION } from './seed'
import type {
  AppNotification,
  AppState,
  LoggedExercise,
  LoggedMeal,
  Post,
  Profile,
  Settings,
  WorkoutSession,
} from './types'

const STORAGE_KEY = 'sho.state.v1'

/* ------------------------------ Actions ------------------------------ */
export type Action =
  | { type: 'SET_SETTINGS'; patch: Partial<Settings> }
  | { type: 'SET_PROFILE'; patch: Partial<Profile> }
  | { type: 'COMPLETE_ONBOARDING'; profile: Partial<Profile> }
  | { type: 'LOG_WEIGHT'; kg: number }
  | { type: 'ADJUST_WATER'; deltaL: number }
  | { type: 'PATCH_TODAY_HABIT'; patch: Partial<{ steps: number; sleepH: number; mindsetMin: number; waterL: number }> }
  | { type: 'ADD_MEAL'; meal: Omit<LoggedMeal, 'id' | 'dateKey'> }
  | { type: 'REMOVE_MEAL'; id: string }
  | { type: 'SAVE_SESSION'; session: WorkoutSession }
  | { type: 'TOGGLE_EXERCISE_DONE'; defId: string }
  | { type: 'COMPLETE_WORKOUT'; id: string }
  | { type: 'TOGGLE_LIKE'; postId: string }
  | { type: 'TOGGLE_BOOKMARK'; postId: string }
  | { type: 'ADD_POST'; text: string; image?: string }
  | { type: 'JOIN_CHALLENGE'; id: string }
  | { type: 'RSVP_EVENT'; id: string }
  | { type: 'JOIN_GROUP'; id: string }
  | { type: 'MARK_NOTIF_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'ADD_NOTIFICATION'; notif: Omit<AppNotification, 'id' | 'dateKey' | 'time' | 'read'> }
  | { type: 'ADD_PHOTO'; dataUrl: string; note?: string }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'RESET_DEMO' }
  | { type: 'RESET_EMPTY' }

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function recalc(s: WorkoutSession): WorkoutSession {
  const volumeKg = Math.round(
    s.exercises.reduce((a, ex) => a + ex.sets.reduce((b, set) => b + (set.done ? set.weightKg * set.reps : 0), 0), 0),
  )
  return { ...s, volumeKg }
}

/* ------------------------------ Reducer ------------------------------ */
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } }

    case 'COMPLETE_ONBOARDING':
      return { ...state, profile: { ...state.profile, ...action.profile, onboarded: true } }

    case 'LOG_WEIGHT': {
      const others = state.weights.filter((w) => w.dateKey !== todayKey)
      return { ...state, weights: [...others, { dateKey: todayKey, kg: action.kg }].sort((a, b) => a.dateKey.localeCompare(b.dateKey)) }
    }

    case 'ADJUST_WATER': {
      const habits = state.habits.map((h) =>
        h.dateKey === todayKey ? { ...h, waterL: Math.max(0, Math.round((h.waterL + action.deltaL) * 10) / 10) } : h,
      )
      return { ...state, habits }
    }

    case 'PATCH_TODAY_HABIT': {
      const habits = state.habits.map((h) => (h.dateKey === todayKey ? { ...h, ...action.patch } : h))
      return { ...state, habits }
    }

    case 'ADD_MEAL': {
      const meal: LoggedMeal = { ...action.meal, id: `m-${Date.now()}`, dateKey: todayKey }
      return { ...state, meals: [...state.meals, meal] }
    }

    case 'REMOVE_MEAL':
      return { ...state, meals: state.meals.filter((m) => m.id !== action.id) }

    case 'SAVE_SESSION': {
      const exists = state.sessions.some((s) => s.id === action.session.id)
      const sessions = exists
        ? state.sessions.map((s) => (s.id === action.session.id ? recalc(action.session) : s))
        : [...state.sessions, recalc(action.session)]
      return { ...state, sessions }
    }

    case 'TOGGLE_EXERCISE_DONE': {
      const sessions = state.sessions.map((s) => {
        if (s.dateKey !== todayKey) return s
        const exercises = s.exercises.map((ex) => {
          if (ex.defId !== action.defId) return ex
          const allDone = ex.sets.every((set) => set.done)
          return { ...ex, sets: ex.sets.map((set) => ({ ...set, done: !allDone })) }
        })
        return recalc({ ...s, exercises })
      })
      return { ...state, sessions }
    }

    case 'COMPLETE_WORKOUT': {
      const sessions = state.sessions.map((s) =>
        s.id === action.id ? recalc({ ...s, completed: true }) : s,
      )
      const habits = state.habits.map((h) => (h.dateKey === todayKey ? { ...h, workout: true } : h))
      const notif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'workout',
        title: 'Workout complete! 💪',
        body: 'Nice work — your stats and streak have been updated.',
        dateKey: todayKey,
        time: nowTime(),
        read: false,
      }
      return { ...state, sessions, habits, notifications: [notif, ...state.notifications] }
    }

    case 'TOGGLE_LIKE': {
      const posts = state.posts.map((p) =>
        p.id === action.postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      )
      return { ...state, posts }
    }

    case 'TOGGLE_BOOKMARK': {
      const posts = state.posts.map((p) => (p.id === action.postId ? { ...p, bookmarked: !p.bookmarked } : p))
      return { ...state, posts }
    }

    case 'ADD_POST': {
      const post: Post = {
        id: `post-${Date.now()}`,
        authorId: 'you',
        author: `${state.profile.name} M.`,
        dateKey: todayKey,
        time: 'Just now',
        text: action.text,
        image: action.image,
        likes: 0,
        comments: 0,
        liked: false,
        bookmarked: false,
      }
      return { ...state, posts: [post, ...state.posts] }
    }

    case 'JOIN_CHALLENGE': {
      const challenges = state.challenges.map((c) =>
        c.id === action.id ? { ...c, joined: !c.joined, participants: c.participants + (c.joined ? -1 : 1) } : c,
      )
      return { ...state, challenges }
    }

    case 'RSVP_EVENT': {
      const events = state.events.map((e) =>
        e.id === action.id ? { ...e, rsvp: !e.rsvp, going: e.going + (e.rsvp ? -1 : 1) } : e,
      )
      return { ...state, events }
    }

    case 'JOIN_GROUP': {
      const groups = state.groups.map((g) =>
        g.id === action.id ? { ...g, joined: !g.joined, members: g.members + (g.joined ? -1 : 1) } : g,
      )
      return { ...state, groups }
    }

    case 'MARK_NOTIF_READ':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) }

    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }

    case 'ADD_NOTIFICATION': {
      const notif: AppNotification = { ...action.notif, id: `n-${Date.now()}`, dateKey: todayKey, time: nowTime(), read: false }
      return { ...state, notifications: [notif, ...state.notifications] }
    }

    case 'ADD_PHOTO': {
      const photo = { id: `ph-${Date.now()}`, dateKey: todayKey, dataUrl: action.dataUrl, note: action.note }
      return { ...state, photos: [photo, ...state.photos] }
    }

    case 'REMOVE_PHOTO':
      return { ...state, photos: state.photos.filter((p) => p.id !== action.id) }

    case 'RESET_DEMO':
      return buildSeed()

    case 'RESET_EMPTY':
      return emptyState()

    default:
      return state
  }
}

/* ------------------------------ Persistence ------------------------------ */
function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.v === SCHEMA_VERSION) return parsed
    }
  } catch {
    /* ignore */
  }
  return buildSeed()
}

/* ------------------------------ Context ------------------------------ */
const StoreCtx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state])

  // keep the <html> theme class in sync
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('theme-light', state.settings.theme === 'light')
  }, [state.settings.theme])

  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useDispatch() {
  return useStore().dispatch
}

export type { LoggedExercise }
