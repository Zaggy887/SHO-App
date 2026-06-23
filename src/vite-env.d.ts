/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for the coach chat endpoint (defaults to /api/coach). */
  readonly VITE_COACH_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
