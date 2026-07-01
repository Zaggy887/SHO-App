import { LayoutGrid, Dumbbell, Apple, ChartBar as BarChart3, Users } from 'lucide-react'
import type { TabKey } from '../App'

const items: { key: TabKey; label: string; Icon: typeof LayoutGrid }[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { key: 'workout', label: 'Workout', Icon: Dumbbell },
  { key: 'nutrition', label: 'Nutrition', Icon: Apple },
  { key: 'progress', label: 'Progress', Icon: BarChart3 },
  { key: 'community', label: 'Community', Icon: Users },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-white/8 bg-ink-900/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 pt-2.5" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}>
        {items.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-1 flex-col items-center gap-1 py-1 transition active:scale-90"
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.6 : 2}
                className={isActive ? 'text-brand-400' : 'text-white/45'}
              />
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? 'text-brand-400' : 'text-white/45'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
