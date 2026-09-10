/**
 * CodeShare Service Worker
 * Provides offline shell caching and a clean install experience.
 * Strategy: Cache-first for static assets, network-first for API/data.
 */

const CACHE_NAME = 'codeshare-v1';

// Static shell assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
];

// ── Install: pre-cache shell ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for static ──────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, and Supabase/socket requests
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/')
  ) {
    return;
  }

  // For navigation requests: serve cached shell, fallback to network
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then((cached) => cached || fetch(request))
    );
    return;
  }

  // Cache-first for static assets (JS/CSS/fonts/icons)
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Only cache successful same-origin responses
          if (
            response.ok &&
            response.type === 'basic' &&
            (url.pathname.match(/\.(js|css|svg|png|woff2?|ico)$/) ||
              url.pathname === '/')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
