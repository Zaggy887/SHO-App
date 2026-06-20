import {
  Footprints, Bike, Waves, Mountain, Flame, Music, Heart, Activity, Dumbbell, type LucideIcon,
} from 'lucide-react'

/* Map an activity preset key to a lucide icon. Falls back to a generic
 * Activity glyph so custom activities still render nicely. */
const MAP: Record<string, LucideIcon> = {
  run: Footprints,
  walk: Footprints,
  hike: Mountain,
  climb: Mountain,
  cycle: Bike,
  swim: Waves,
  row: Waves,
  football: Activity,
  basketball: Activity,
  tennis: Activity,
  pickleball: Activity,
  boxing: Activity,
  dance: Music,
  yoga: Heart,
  hiit: Flame,
  gym: Dumbbell,
  other: Activity,
}

export function ActivityIcon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const Cmp = MAP[name] ?? Activity
  return <Cmp size={size} className={className} strokeWidth={2.2} />
}
