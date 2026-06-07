import { Signal, Wifi, BatteryFull } from 'lucide-react'

/** Faux iOS status bar to complete the app look on desktop preview. */
export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-3.5 pb-1 text-sm font-semibold text-white">
      <span className="tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={2.5} />
        <Wifi size={16} strokeWidth={2.5} />
        <BatteryFull size={20} strokeWidth={2} />
      </div>
    </div>
  )
}
