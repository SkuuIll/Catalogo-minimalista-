self.addEventListener('install', (e: any) => {
  e.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (e: any) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e: any) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
