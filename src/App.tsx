import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { StatusBar } from './components/StatusBar'
import { StoreProvider, useStore } from './store/store'
import { ToastProvider } from './components/Toast'
import { NavProvider, type Overlay } from './nav'
import Dashboard from './screens/Dashboard'
import Workout from './screens/Workout'
import Nutrition from './screens/Nutrition'
import Progress from './screens/Progress'
import Community from './screens/Community'
import Onboarding from './screens/Onboarding'
import ActiveWorkout from './screens/ActiveWorkout'
import {
  NotificationsSheet,
  SettingsSheet,
  ProfileSheet,
  AddFoodSheet,
  LogWeightSheet,
  LogHabitSheet,
  LogActivitySheet,
  LogMeasurementSheet,
  CreatePostSheet,
  WeeklyRecapSheet,
  LeaderboardSheet,
  PhotosSheet,
  QuickWorkoutsSheet,
  BadgesSheet,
  ExamModeSheet,
  CoachSheet,
  CoachChatSheet,
  BeginnerSheet,
  BudgetEatsSheet,
  ExerciseDetailSheet,
  PartnerMatchSheet,
  PRCelebrationSheet,
} from './overlays'

export type TabKey = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'community'

const screens: Record<TabKey, React.ComponentType> = {
  dashboard: Dashboard,
  workout: Workout,
  nutrition: Nutrition,
  progress: Progress,
  community: Community,
}

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [params, setParams] = useState<Record<string, unknown>>({})

  const nav = {
    open: (o: Overlay, p: Record<string, unknown> = {}) => {
      setParams(p)
      setOverlay(o)
    },
    close: () => setOverlay(null),
    goTab: (t: TabKey) => {
      setOverlay(null)
      setTab(t)
    },
  }

  if (!state.profile.onboarded) {
    return (
      <NavProvider value={nav}>
        <Onboarding />
      </NavProvider>
    )
  }

  const Screen = screens[tab]

  return (
    <NavProvider value={nav}>
      <StatusBar />
      <main key={tab} className="no-scrollbar flex-1 overflow-y-auto animate-screen-in" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 7rem)' }}>
        <Screen />
      </main>
      <BottomNav active={tab} onChange={setTab} />

      {/* Overlays */}
      <ActiveWorkout open={overlay === 'activeWorkout'} onClose={nav.close} />
      <NotificationsSheet open={overlay === 'notifications'} onClose={nav.close} />
      <SettingsSheet open={overlay === 'settings'} onClose={nav.close} />
      <ProfileSheet open={overlay === 'profile'} onClose={nav.close} />
      <AddFoodSheet open={overlay === 'addFood'} onClose={nav.close} params={params} />
      <LogWeightSheet open={overlay === 'logWeight'} onClose={nav.close} />
      <LogHabitSheet open={overlay === 'logHabit'} onClose={nav.close} params={params} />
      <LogActivitySheet open={overlay === 'logActivity'} onClose={nav.close} />
      <LogMeasurementSheet open={overlay === 'logMeasurement'} onClose={nav.close} />
      <CreatePostSheet open={overlay === 'createPost'} onClose={nav.close} />
      <WeeklyRecapSheet open={overlay === 'recap'} onClose={nav.close} />
      <LeaderboardSheet open={overlay === 'leaderboard'} onClose={nav.close} />
      <PhotosSheet open={overlay === 'photos'} onClose={nav.close} />
      <QuickWorkoutsSheet open={overlay === 'quick'} onClose={nav.close} />
      <BadgesSheet open={overlay === 'badges'} onClose={nav.close} />
      <ExamModeSheet open={overlay === 'examMode'} onClose={nav.close} />
      <CoachSheet open={overlay === 'coach'} onClose={nav.close} />
      <CoachChatSheet open={overlay === 'coachChat'} onClose={nav.close} />
      <BeginnerSheet open={overlay === 'beginner'} onClose={nav.close} />
      <BudgetEatsSheet open={overlay === 'budgetEats'} onClose={nav.close} />
      <ExerciseDetailSheet open={overlay === 'exerciseDetail'} onClose={nav.close} params={params} />
      <PartnerMatchSheet open={overlay === 'partnerMatch'} onClose={nav.close} />
      <PRCelebrationSheet open={overlay === 'prCelebration'} onClose={nav.close} params={params} />
    </NavProvider>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <div className="flex min-h-screen w-full items-center justify-center p-0 sm:p-6" style={{ background: 'var(--frame)' }}>
        <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-ink-900 text-white sm:h-[920px] sm:rounded-[44px] sm:border-[10px] sm:border-zinc-800 sm:shadow-2xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <ToastProvider>
            <Shell />
          </ToastProvider>
        </div>
      </div>
    </StoreProvider>
  )
}
