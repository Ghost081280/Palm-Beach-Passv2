// sw.js - Service Worker for Palm Beach Pass PWA
const CACHE_NAME = 'palm-beach-pass-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/mobile.html',
    '/mobile-purchase.html',
    '/checkout.html',
    '/customer-passes.html',
    '/customer-account.html',
    '/device-detector.js',
    '/manifest.json',
    // Add any other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Cache installation failed:', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Ensure the new service worker takes control immediately
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // For HTML files, try to fetch fresh version in background
                    if (event.request.destination === 'document') {
                        fetch(event.request)
                            .then((freshResponse) => {
                                if (freshResponse.ok) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => {
                                            cache.put(event.request, freshResponse.clone());
                                        });
                                }
                            })
                            .catch(() => {
                                // Network failed, stick with cached version
                            });
                    }
                    return cachedResponse;
                }
                
                // If not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();
                        
                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Network failed and no cache available
                        // Return offline page for HTML requests
                        if (event.request.destination === 'document') {
                            return new Response(
                                `<!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Offline - Palm Beach Pass</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    <style>
                                        body {
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: center;
                                            height: 100vh;
                                            margin: 0;
                                            background: linear-gradient(135deg, #FAF3E3 0%, #FFFFFF 100%);
                                            color: #1A1A1A;
                                            text-align: center;
                                            padding: 2rem;
                                        }
                                        .offline-icon { font-size: 4rem; margin-bottom: 2rem; }
                                        h1 { color: #2D5016; margin-bottom: 1rem; }
                                        .retry-btn {
                                            background: #2D5016;
                                            color: white;
                                            border: none;
                                            padding: 1rem 2rem;
                                            border-radius: 50px;
                                            cursor: pointer;
                                            margin-top: 2rem;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="offline-icon">🌴</div>
                                    <h1>You're offline</h1>
                                    <p>Your passes are still available! Check your internet connection to access new features.</p>
                                    <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
                                </body>
                                </html>`,
                                {
                                    headers: {
                                        'Content-Type': 'text/html',
                                    },
                                }
                            );
                        }
                        
                        // For other requests, return a generic offline response
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // Handle any offline actions that need to be synced
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Implement background sync logic here
    // For example, sync pass usage analytics, user preferences, etc.
    return Promise.resolve();
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        
        event.waitUntil(
            self.registration.showNotification('Palm Beach Pass', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/mobile.html')
    );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'UPDATE_CACHE':
                // Force update cache
                event.waitUntil(updateCache());
                break;
        }
    }
});

function updateCache() {
    return caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(urlsToCache);
        });
}
