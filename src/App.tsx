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
  MenuDrawer,
  LogWeightSheet,
  LogHabitSheet,
  LogActivitySheet,
  CreatePostSheet,
  WeeklyRecapSheet,
  LeaderboardSheet,
  PhotosSheet,
  QuickWorkoutsSheet,
  BadgesSheet,
  ExamModeSheet,
  CoachSheet,
  CoachChatSheet,
  CustomizeSheet,
  BeginnerSheet,
  BudgetEatsSheet,
  ExerciseDetailSheet,
  PartnerMatchSheet,
  PRCelebrationSheet,
  PostDetailSheet,
  ChallengeDetailSheet,
} from './overlays'

export type TabKey = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'community'

const screens: Record<TabKey, React.ComponentType> = {
  dashboard: Dashboard,
  workout: Workout,
  nutrition: Nutrition,
  progress: Progress,
  community: Community,
}

const TAB_ORDER: TabKey[] = ['dashboard', 'workout', 'nutrition', 'progress', 'community']

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [dir, setDir] = useState<1 | -1>(1)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [menuOpen, setMenuOpen] = useState(false)

  // Switch tabs with a directional slide, so navigation feels alive.
  const changeTab = (next: TabKey) => {
    setDir(TAB_ORDER.indexOf(next) >= TAB_ORDER.indexOf(tab) ? 1 : -1)
    setTab(next)
  }

  const nav = {
    open: (o: Overlay, p: Record<string, unknown> = {}) => {
      setParams(p)
      setOverlay(o)
    },
    close: () => setOverlay(null),
    goTab: (t: TabKey) => {
      setOverlay(null)
      setMenuOpen(false)
      changeTab(t)
    },
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
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
      <main key={tab} className={`no-scrollbar flex-1 overflow-y-auto ${dir === 1 ? 'animate-tab-right' : 'animate-tab-left'}`} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 7rem)' }}>
        <Screen />
      </main>
      <BottomNav active={tab} onChange={changeTab} />

      {/* Overlays */}
      <ActiveWorkout open={overlay === 'activeWorkout'} onClose={nav.close} />
      <NotificationsSheet open={overlay === 'notifications'} onClose={nav.close} />
      <SettingsSheet open={overlay === 'settings'} onClose={nav.close} />
      <MenuDrawer open={menuOpen} onClose={nav.closeMenu} />
      <LogWeightSheet open={overlay === 'logWeight'} onClose={nav.close} />
      <LogHabitSheet open={overlay === 'logHabit'} onClose={nav.close} params={params} />
      <LogActivitySheet open={overlay === 'logActivity'} onClose={nav.close} />
      <CreatePostSheet open={overlay === 'createPost'} onClose={nav.close} />
      <WeeklyRecapSheet open={overlay === 'recap'} onClose={nav.close} />
      <LeaderboardSheet open={overlay === 'leaderboard'} onClose={nav.close} />
      <PhotosSheet open={overlay === 'photos'} onClose={nav.close} />
      <QuickWorkoutsSheet open={overlay === 'quick'} onClose={nav.close} />
      <BadgesSheet open={overlay === 'badges'} onClose={nav.close} />
      <ExamModeSheet open={overlay === 'examMode'} onClose={nav.close} />
      <CoachSheet open={overlay === 'coach'} onClose={nav.close} />
      <CoachChatSheet open={overlay === 'coachChat'} onClose={nav.close} />
      <CustomizeSheet open={overlay === 'customize'} onClose={nav.close} />
      <BeginnerSheet open={overlay === 'beginner'} onClose={nav.close} />
      <BudgetEatsSheet open={overlay === 'budgetEats'} onClose={nav.close} />
      <ExerciseDetailSheet open={overlay === 'exerciseDetail'} onClose={nav.close} params={params} />
      <PartnerMatchSheet open={overlay === 'partnerMatch'} onClose={nav.close} />
      <PRCelebrationSheet open={overlay === 'prCelebration'} onClose={nav.close} params={params} />
      <PostDetailSheet open={overlay === 'postDetail'} onClose={nav.close} params={params} />
      <ChallengeDetailSheet open={overlay === 'challengeDetail'} onClose={nav.close} params={params} />
    </NavProvider>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <div className="flex min-h-screen w-full items-center justify-center p-0 sm:p-6" style={{ background: 'var(--frame)' }}>
        <div id="app-frame" className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-ink-900 text-white sm:h-[920px] sm:rounded-[44px] sm:border-[10px] sm:border-zinc-800 sm:shadow-2xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <ToastProvider>
            <Shell />
          </ToastProvider>
        </div>
      </div>
    </StoreProvider>
  )
}
