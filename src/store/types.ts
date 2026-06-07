export type Units = 'metric' | 'imperial'
export type Theme = 'dark' | 'light'
export type Goal = 'build-muscle' | 'lose-fat' | 'gain-strength' | 'stay-healthy'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type Equipment = 'full-gym' | 'home-basic' | 'dorm-bodyweight'
export type MealName = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'

export interface Profile {
  name: string
  age: number
  sex: 'male' | 'female' | 'other'
  university: string
  goal: Goal
  experience: Experience
  daysPerWeek: number
  equipment: Equipment
  heightCm: number
  startWeightKg: number
  goalWeightKg: number
  calorieTarget: number
  proteinTarget: number
  carbTarget: number
  fatTarget: number
  waterTargetL: number
  stepTarget: number
  sleepTargetH: number
  onboarded: boolean
  examMode: boolean
  budgetMode: boolean
  createdAtKey: string
}

export interface Settings {
  units: Units
  theme: Theme
  notificationsEnabled: boolean
}

export interface WeightEntry {
  dateKey: string
  kg: number
}

export interface HabitDay {
  dateKey: string
  steps: number
  sleepH: number
  waterL: number
  mindsetMin: number
  /** 0..10 nutrition adherence score */
  nutritionScore: number
  workout: boolean
}

export interface FoodItem {
  id: string
  name: string
  brand?: string
  serving: string
  kcal: number
  p: number
  c: number
  f: number
  barcode?: string
  budget?: boolean
}

export interface LoggedMeal {
  id: string
  dateKey: string
  meal: MealName
  name: string
  qty: number
  kcal: number
  p: number
  c: number
  f: number
}

export interface ExerciseDef {
  id: string
  name: string
  muscle: string
  equipment: Equipment[]
  image: string
  bodyweightAlt?: string
}

export interface SetLog {
  weightKg: number
  reps: number
  done: boolean
}

export interface LoggedExercise {
  defId: string
  name: string
  image: string
  targetSets: number
  targetReps: string
  sets: SetLog[]
}

export interface WorkoutSession {
  id: string
  dateKey: string
  name: string
  focus: string
  image: string
  durationMin: number
  volumeKg: number
  calories: number
  exercises: LoggedExercise[]
  completed: boolean
}

export interface ProgramDay {
  id: string
  day: string
  name: string
  focus: string
  rest?: boolean
  exerciseIds: string[]
}

export interface Post {
  id: string
  authorId: string
  author: string
  dateKey: string
  time: string
  text: string
  image?: string
  ring?: number
  ringLabel?: string
  likes: number
  comments: number
  liked: boolean
  bookmarked: boolean
}

export interface LeaderUser {
  id: string
  name: string
  university: string
  points: number
  workouts: number
  streak: number
  isYou?: boolean
  friend?: boolean
}

export interface Challenge {
  id: string
  title: string
  weeks: number
  totalWeeks: number
  currentWeek: number
  participants: number
  joined: boolean
  progressPct: number
  rank?: number
}

export interface Badge {
  id: string
  name: string
  desc: string
  icon: string
  earned: boolean
  earnedDateKey?: string
}

export interface AppNotification {
  id: string
  type: 'workout' | 'nutrition' | 'streak' | 'social' | 'challenge' | 'system'
  title: string
  body: string
  dateKey: string
  time: string
  read: boolean
}

export interface CommunityEvent {
  id: string
  title: string
  when: string
  host: string
  going: number
  rsvp: boolean
}

export interface Group {
  id: string
  icon: string
  name: string
  members: number
  desc: string
  unread: number
  color: string
  joined: boolean
}

export interface ProgressPhoto {
  id: string
  dateKey: string
  dataUrl: string
  note?: string
}

export interface QuickWorkout {
  id: string
  name: string
  minutes: number
  focus: string
  exercises: string[]
}

export interface AppState {
  profile: Profile
  settings: Settings
  weights: WeightEntry[]
  habits: HabitDay[]
  meals: LoggedMeal[]
  foods: FoodItem[]
  sessions: WorkoutSession[]
  program: ProgramDay[]
  posts: Post[]
  leaderboard: LeaderUser[]
  challenges: Challenge[]
  badges: Badge[]
  notifications: AppNotification[]
  events: CommunityEvent[]
  groups: Group[]
  photos: ProgressPhoto[]
  /** schema version for migrations */
  v: number
}
