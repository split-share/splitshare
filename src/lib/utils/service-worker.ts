import {
	updateServiceWorkerStatus,
	initConnectionMonitoring,
	cleanupConnectionMonitoring
} from '$lib/stores/connection.svelte';
import { initializeSync } from '$lib/services/sync.service';

/**
 * Register the service worker for PWA support
 */
export async function registerServiceWorker(): Promise<void> {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	try {
		const registration = await navigator.serviceWorker.register('/service-worker.js', {
			scope: '/'
		});

		updateServiceWorkerStatus({ registered: true });

		// Handle updates
		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					// New version available
					updateServiceWorkerStatus({ updateAvailable: true });
				}
			});
		});

		// Listen for messages from service worker
		navigator.serviceWorker.addEventListener('message', (event) => {
			if (event.data.type === 'SYNC_WORKOUT_DATA') {
				// Trigger sync when service worker requests it
				initializeSync();
			}
		});

		// Wait for service worker to be ready before marking offline ready
		await navigator.serviceWorker.ready;

		// Check if caches are populated
		const cacheNames = await caches.keys();
		if (cacheNames.length > 0) {
			updateServiceWorkerStatus({ offlineReady: true });
		}
	} catch {
		// Service worker registration failed - app will work without offline support
	}
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipServiceWorkerWaiting(): Promise<void> {
	if (!navigator.serviceWorker.controller) return;

	navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Handle online event - trigger sync
 */
function handleOnline() {
	initializeSync();
}

/**
 * Initialize all offline capabilities
 */
export function initializeOfflineSupport(): () => void {
	if (typeof window === 'undefined') {
		return () => {};
	}

	// Initialize connection monitoring
	initConnectionMonitoring();

	// Register service worker and then initialize sync
	registerServiceWorker().then(() => {
		// Initialize sync when online
		if (navigator.onLine) {
			initializeSync().catch(() => {
				// Initial sync failed, will retry when online event fires
			});
		}
	});

	// Listen for online events to trigger sync
	window.addEventListener('online', handleOnline);

	// Return cleanup function
	return () => {
		cleanupConnectionMonitoring();
		window.removeEventListener('online', handleOnline);
	};
}
