// Minimal, safety-first service worker.
//
// What is cached: the offline fallback shell (/offline.html), the web app
// manifest, and app icons — plus Next.js's own hashed, immutable
// /_next/static/ chunks (content-addressed by build, so a stale cached
// chunk is never served for a different deployment once the cache name
// below is bumped).
//
// What is never cached, on purpose: any actual application page (dashboard,
// students, fees, attendance, results, certificates, ...), any API/RSC
// data response, and anything cross-origin. A school system holds
// financial and student records — caching a page shell would risk showing
// one viewer's stale, or even another viewer's, cached data after a role
// switch or logout, and pretending a write succeeded while offline would
// corrupt attendance/payment/marks records. Every navigation therefore
// always goes to the network first; only when that fetch fails outright
// (truly offline) do we fall back to the static, dataless /offline.html
// shell — never to a cached copy of a real page.
const CACHE_NAME = "sms-shell-v1";
const PRECACHE_URLS = ["/offline.html", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept writes
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin requests

  // Next.js's content-hashed build assets: safe to cache-first, since a
  // new deployment ships a new hash (and a new CACHE_NAME on SW update).
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Page navigations: always try the network first (real, live, correctly
  // authorized data). Only on total network failure do we show the static
  // offline shell — never a cached page, never fabricated data.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html").then((r) => r ?? Response.error()))
    );
    return;
  }

  // Everything else (API calls, RSC payloads, images, fonts): pass through
  // to the network untouched, with no service-worker caching at all.
});
