import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { StatusBar } from './components/StatusBar'
import Dashboard from './screens/Dashboard'
import Workout from './screens/Workout'
import Nutrition from './screens/Nutrition'
import Progress from './screens/Progress'
import Community from './screens/Community'

export type TabKey = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'community'

const screens: Record<TabKey, React.ComponentType> = {
  dashboard: Dashboard,
  workout: Workout,
  nutrition: Nutrition,
  progress: Progress,
  community: Community,
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard')
  const Screen = screens[tab]

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-black via-zinc-950 to-black p-0 sm:p-6">
      {/* Phone frame (desktop) / full bleed (mobile) */}
      <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-ink-900 sm:h-[920px] sm:rounded-[44px] sm:border-[10px] sm:border-zinc-800 sm:shadow-2xl">
        <StatusBar />

        {/* Scrollable content area */}
        <main key={tab} className="no-scrollbar flex-1 overflow-y-auto pb-28 animate-screen-in">
          <Screen />
        </main>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  )
}
