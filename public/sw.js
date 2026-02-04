
const CACHE_NAME = 'figura-viva-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/portal',
    '/portal/courses',
    '/manifest.json',
    '/favicon.ico',
    // Note: CSS/JS are handled by Next.js build IDs, so we usually use runtime caching
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // We only cache GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip Firebase Auth / Analytics or other external APIs from the service worker cache
    if (url.origin !== self.origin || url.pathname.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached response but refresh in background (Stale-While-Revalidate)
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                });
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Cache new responses
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback for offline pages if fetch fails
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
