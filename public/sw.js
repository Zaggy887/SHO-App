// StrengthHub Online — minimal offline service worker.
// Network-first for navigations (so a fresh deploy's index.html — and the
// latest hashed JS/CSS it points to — always wins), cache-first fallback for
// everything else (hashed assets are immutable, so this is safe offline).
const CACHE = 'sho-cache-v3'

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.add('/')))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return

  // Navigations (the app shell): always try the network first so new builds
  // load immediately. Fall back to the cached shell only when offline.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put('/', copy))
          return res
        })
        .catch(() => caches.match('/').then((cached) => cached || fetch(request))),
    )
    return
  }

  // Other GETs (hashed assets): stale-while-revalidate.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) cache.put(request, res.clone())
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
