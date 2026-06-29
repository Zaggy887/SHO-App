import type { ReactNode } from 'react'
import { Sun } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  ProgressRing: circular progress indicator                          */
/* ------------------------------------------------------------------ */
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = 'rgb(var(--brand-400))',
  track = 'rgba(130,130,130,0.22)',
  children,
}: {
  value: number // 0 - 100
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="ring-animate transition-[stroke-dashoffset] duration-700"
          style={{ ['--ring-start' as string]: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ProgressBar: linear progress                                       */
/* ------------------------------------------------------------------ */
export function ProgressBar({
  value,
  color = 'rgb(var(--brand-400))',
  className = '',
  height = 8,
}: {
  value: number
  color?: string
  className?: string
  height?: number
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/8 ${className}`} style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SectionHeader: title with optional "See all" action                */
/* ------------------------------------------------------------------ */
export function SectionHeader({
  title,
  action,
  onAction,
  right,
}: {
  title: string
  action?: string
  onAction?: () => void
  right?: ReactNode
}) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="section-title">{title}</h2>
      {right
        ? right
        : action && (
            <button className="see-all" onClick={onAction}>
              {action}
            </button>
          )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SegmentedTabs: the underline tab bar used on every section         */
/* ------------------------------------------------------------------ */
export function SegmentedTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (t: string) => void
}) {
  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
      <div className="flex min-w-full gap-6 border-b border-white/5">
        {tabs.map((t) => {
          const isActive = t === active
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={`relative whitespace-nowrap pb-3 text-[15px] font-semibold transition-colors ${
                isActive ? 'text-brand-400' : 'text-white/45'
              }`}
            >
              {t === 'Coach' ? <Sun size={18} /> : t}
              {isActive && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-brand-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pill / Chip helpers                                                */
/* ------------------------------------------------------------------ */
export function Chip({
  children,
  color = 'green',
  className = '',
}: {
  children: ReactNode
  color?: 'green' | 'gray' | 'blue' | 'orange' | 'purple'
  className?: string
}) {
  const map: Record<string, string> = {
    green: 'bg-brand-400/15 text-brand-300',
    gray: 'bg-white/8 text-white/70',
    blue: 'bg-accent-blue/15 text-accent-blue',
    orange: 'bg-accent-orange/15 text-accent-orange',
    purple: 'bg-accent-purple/15 text-accent-purple',
  }
  return <span className={`chip ${map[color]} ${className}`}>{children}</span>
}

/* ------------------------------------------------------------------ */
/*  ScreenHeader: large page title with leading/trailing slots         */
/* ------------------------------------------------------------------ */
export function ScreenHeader({
  title,
  leading,
  trailing,
}: {
  title: string
  leading?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {leading}
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
      </div>
      {trailing}
    </div>
  )
}
