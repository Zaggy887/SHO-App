import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { todayKey } from '../lib/date'
import { buildSeed, emptyState, SCHEMA_VERSION } from './seed'
import { coachReply } from '../lib/coachChat'
import type {
  AppNotification,
  AppState,
  ChatMessage,
  LoggedActivity,
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
  | { type: 'ADD_ACTIVITY'; activity: Omit<LoggedActivity, 'id' | 'dateKey' | 'time'> }
  | { type: 'REMOVE_ACTIVITY'; id: string }
  | { type: 'SAVE_FOOD_REVIEW'; text: string; score: number }
  | { type: 'SEND_CHAT'; text: string }
  | { type: 'MARK_CHAT_READ' }
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
  | { type: 'SET_EXAM_DATES'; startKey: string; endKey: string }
  | { type: 'COMPLETE_LESSON'; id: string }
  | { type: 'GIVE_KUDOS'; postId: string }
  | { type: 'CONNECT_PARTNER'; id: string }
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

    case 'ADD_ACTIVITY': {
      const activity: LoggedActivity = { ...action.activity, id: `act-${Date.now()}`, dateKey: todayKey, time: nowTime() }
      const activities = [activity, ...(state.activities ?? [])]
      // Recognise any logged activity as training for the day.
      const has = state.habits.some((h) => h.dateKey === todayKey)
      const habits = has
        ? state.habits.map((h) => (h.dateKey === todayKey ? { ...h, workout: true } : h))
        : [...state.habits, { dateKey: todayKey, steps: 0, sleepH: 0, waterL: 0, mindsetMin: 0, nutritionScore: 0, workout: true }]
      return { ...state, activities, habits }
    }

    case 'REMOVE_ACTIVITY':
      return { ...state, activities: (state.activities ?? []).filter((a) => a.id !== action.id) }

    case 'SAVE_FOOD_REVIEW': {
      const others = state.foodReviews.filter((r) => r.dateKey !== todayKey)
      const review = action.text.trim() ? [{ dateKey: todayKey, text: action.text, score: action.score }] : []
      // Reflect the day's food quality in today's habit ring too.
      const habits = state.habits.map((h) => (h.dateKey === todayKey ? { ...h, nutritionScore: action.score } : h))
      return { ...state, foodReviews: [...others, ...review], habits }
    }

    case 'SEND_CHAT': {
      const text = action.text.trim()
      if (!text) return state
      const id = Date.now()
      const userMsg: ChatMessage = { id: `c-${id}`, role: 'user', text, dateKey: todayKey, time: nowTime(), read: true }
      const coachMsg: ChatMessage = { id: `c-${id + 1}`, role: 'coach', text: coachReply(state, text), dateKey: todayKey, time: nowTime(), read: false }
      return { ...state, chat: [...state.chat, userMsg, coachMsg] }
    }

    case 'MARK_CHAT_READ':
      return { ...state, chat: state.chat.map((m) => (m.read ? m : { ...m, read: true })) }

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
        title: 'Workout logged',
        body: 'Nice work. Your stats, streak and next session weights are updated.',
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

    case 'SET_EXAM_DATES':
      return { ...state, profile: { ...state.profile, examMode: true, examStartKey: action.startKey, examEndKey: action.endKey } }

    case 'COMPLETE_LESSON':
      return state.beginnerProgress.includes(action.id)
        ? state
        : { ...state, beginnerProgress: [...state.beginnerProgress, action.id] }

    case 'GIVE_KUDOS': {
      const posts = state.posts.map((p) =>
        p.id === action.postId ? { ...p, gaveKudos: !p.gaveKudos, kudos: (p.kudos ?? 0) + (p.gaveKudos ? -1 : 1) } : p,
      )
      return { ...state, posts }
    }

    case 'CONNECT_PARTNER': {
      const partners = state.partners.map((p) => (p.id === action.id ? { ...p, connected: !p.connected } : p))
      return { ...state, partners }
    }

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

  // keep <html> lang + text direction in sync (Arabic is right-to-left)
  useEffect(() => {
    const lang = state.settings.language ?? 'en'
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [state.settings.language])

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
