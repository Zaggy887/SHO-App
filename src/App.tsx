import { useEffect, useState } from 'react'
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
import Privacy from './screens/Privacy'
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

function Shell({ onNavigatePrivacy }: { onNavigatePrivacy: () => void }) {
  const { state } = useStore()
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = {
    open: (o: Overlay, p: Record<string, unknown> = {}) => {
      setParams(p)
      setOverlay(o)
    },
    close: () => setOverlay(null),
    goTab: (t: TabKey) => {
      setOverlay(null)
      setMenuOpen(false)
      setTab(t)
    },
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    goPrivacy: onNavigatePrivacy,
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

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return {
    path,
    navigate: (p: string) => {
      if (p !== window.location.pathname) window.history.pushState({}, '', p)
      setPath(p)
    },
  }
}

export default function App() {
  const { path, navigate } = useRoute()
  return (
    <StoreProvider>
      <div className="flex min-h-[100dvh] w-full justify-center sm:min-h-screen sm:items-center sm:p-6" style={{ background: 'var(--frame)' }}>
        <div id="app-frame" className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-ink-900 text-white app-frame-safe-top sm:h-[920px] sm:max-w-[440px] sm:rounded-[44px] sm:border-[10px] sm:border-zinc-800 sm:shadow-2xl">
          <ToastProvider>
            {path === '/privacy' ? (
              <Privacy onBack={() => navigate('/')} />
            ) : (
              <Shell onNavigatePrivacy={() => navigate('/privacy')} />
            )}
          </ToastProvider>
        </div>
      </div>
    </StoreProvider>
  )
}
