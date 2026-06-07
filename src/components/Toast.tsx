import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

type Toast = { id: number; msg: string }
const ToastCtx = createContext<(msg: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-700/95 px-4 py-2.5 text-sm font-semibold text-white shadow-card backdrop-blur"
            style={{ animation: 'screen-in 0.2s ease-out' }}
          >
            <CheckCircle2 size={16} className="text-brand-400" />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
