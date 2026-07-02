import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted brand font: same premium type on iOS, Android and desktop,
// bundled locally so it also works offline as a PWA.
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the service worker for installable / offline support.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support unavailable; app still works online */
    })
  })
}
