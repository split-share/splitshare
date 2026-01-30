/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

// Configuration
const CACHE_NAME = `splitshare-cache-${version}`;
const ASSETS = [...build, ...files];
const API_CACHE_NAME = `splitshare-api-${version}`;

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
						.map((key) => caches.delete(key))
				)
			)
			.then(() => self.clients.claim())
	);
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip external requests
	if (url.origin !== self.location.origin) return;

	// Handle API requests with stale-while-revalidate strategy
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(handleApiRequest(request));
		return;
	}

	// Handle static assets with cache-first strategy
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(handleStaticAsset(request));
		return;
	}

	// Handle navigation requests (HTML pages)
	if (request.mode === 'navigate') {
		event.respondWith(handleNavigation(request));
		return;
	}
});

/**
 * Handle API requests with stale-while-revalidate strategy
 * Returns cached response immediately, then fetches fresh data
 */
async function handleApiRequest(request: Request): Promise<Response> {
	const cache = await caches.open(API_CACHE_NAME);

	// Try to get from cache first
	const cached = await cache.match(request);

	// Fetch from network in background
	const fetchPromise = fetch(request)
		.then((response) => {
			if (response.ok) {
				cache.put(request, response.clone());
			}
			return response;
		})
		.catch(() => {
			// Network failed, cached will be returned below if available
			return undefined;
		});

	// Return cached immediately if available, otherwise wait for network
	if (cached) {
		return cached;
	}

	const networkResponse = await fetchPromise;
	if (!networkResponse) {
		return new Response(JSON.stringify({ error: 'Network unavailable' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return networkResponse;
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticAsset(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match(request);

	if (cached) {
		return cached;
	}

	const response = await fetch(request);
	if (response.ok) {
		cache.put(request, response.clone());
	}
	return response;
}

/**
 * Handle navigation requests with network-first fallback to cache
 */
async function handleNavigation(request: Request): Promise<Response> {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		const cache = await caches.open(CACHE_NAME);
		const cached = await cache.match(request);

		if (cached) {
			return cached;
		}

		// Return offline fallback page if available
		const offlinePage = await cache.match('/offline.html');
		if (offlinePage) {
			return offlinePage;
		}

		throw error;
	}
}

// Background sync for deferred actions
self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-workout-data') {
		event.waitUntil(syncWorkoutData());
	}
});

/**
 * Sync workout data when connection is restored
 */
async function syncWorkoutData(): Promise<void> {
	const clients = await self.clients.matchAll({ type: 'window' });
	clients.forEach((client) => {
		client.postMessage({
			type: 'SYNC_WORKOUT_DATA'
		});
	});
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
	if (!event.data) return;

	const data = event.data.json();
	const options: NotificationOptions = {
		body: data.body,
		icon: '/icons/icon-192x192.png',
		badge: '/icons/icon-72x72.png',
		tag: data.tag,
		requireInteraction: data.requireInteraction || false
	};

	event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clients) => {
			if (clients.length > 0) {
				clients[0].focus();
			} else {
				self.clients.openWindow('/');
			}
		})
	);
});

// Message handling from main thread
self.addEventListener('message', (event) => {
	if (event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
