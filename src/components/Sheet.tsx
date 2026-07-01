import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Bottom sheet / modal used for logging flows and the active workout. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  full = false,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  full?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
      />
      <div
        className={`animate-sheet-up relative flex flex-col rounded-t-3xl border-t border-white/10 bg-ink-900 ${
          full ? 'h-[92%]' : 'max-h-[88%]'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
          <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20" />
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-white/70 active:bg-white/15">
            <X size={18} />
          </button>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 px-6 py-12 text-center">
      <div className="mb-3 text-white/30">{icon}</div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 max-w-[220px] text-[13px] text-white/45">{body}</p>
    </div>
  )
}
