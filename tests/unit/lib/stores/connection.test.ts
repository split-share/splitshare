import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	initConnectionMonitoring,
	cleanupConnectionMonitoring,
	updateServiceWorkerStatus,
	updateSyncStatus,
	setSyncInProgress,
	markSyncSuccessful,
	incrementPendingSyncs,
	decrementPendingSyncs,
	isOnline,
	hasPendingSyncs,
	isOfflineReady,
	connectionState,
	syncState,
	serviceWorkerState
} from '$lib/stores/connection.svelte';

describe('Connection Store', () => {
	beforeEach(() => {
		// Reset state
		updateSyncStatus({
			pendingCount: 0,
			lastSyncAttempt: null,
			lastSuccessfulSync: null,
			syncInProgress: false
		});
		updateServiceWorkerStatus({
			registered: false,
			updateAvailable: false,
			offlineReady: false
		});

		// Reset mocks
		vi.restoreAllMocks();
	});

	afterEach(() => {
		cleanupConnectionMonitoring();
		vi.restoreAllMocks();
	});

	describe('isOnline derived store', () => {
		it('should reflect online status', () => {
			// Initially should be true (default state)
			expect(isOnline.current).toBe(true);
		});
	});

	describe('isOfflineReady derived store', () => {
		it('should be false when service worker is not registered', () => {
			updateServiceWorkerStatus({ registered: false, offlineReady: false });
			expect(isOfflineReady.current).toBe(false);
		});

		it('should be true when service worker is registered and offline ready', () => {
			updateServiceWorkerStatus({ registered: true, offlineReady: true });
			expect(isOfflineReady.current).toBe(true);
		});

		it('should be false when service worker is registered but not offline ready', () => {
			updateServiceWorkerStatus({ registered: true, offlineReady: false });
			expect(isOfflineReady.current).toBe(false);
		});
	});

	describe('hasPendingSyncs derived store', () => {
		it('should be false when no pending syncs', () => {
			updateSyncStatus({ pendingCount: 0 });
			expect(hasPendingSyncs.current).toBe(false);
		});

		it('should be true when there are pending syncs', () => {
			updateSyncStatus({ pendingCount: 3 });
			expect(hasPendingSyncs.current).toBe(true);
		});
	});

	describe('updateServiceWorkerStatus', () => {
		it('should update service worker status', () => {
			updateServiceWorkerStatus({ registered: true });
			expect(serviceWorkerState.registered).toBe(true);
			expect(serviceWorkerState.updateAvailable).toBe(false);
			expect(serviceWorkerState.offlineReady).toBe(false);
		});

		it('should update multiple properties', () => {
			updateServiceWorkerStatus({
				registered: true,
				updateAvailable: true,
				offlineReady: true
			});
			expect(serviceWorkerState.registered).toBe(true);
			expect(serviceWorkerState.updateAvailable).toBe(true);
			expect(serviceWorkerState.offlineReady).toBe(true);
		});

		it('should preserve unmodified properties', () => {
			updateServiceWorkerStatus({ registered: true });
			updateServiceWorkerStatus({ updateAvailable: true });
			expect(serviceWorkerState.registered).toBe(true);
			expect(serviceWorkerState.updateAvailable).toBe(true);
		});
	});

	describe('updateSyncStatus', () => {
		it('should update sync status', () => {
			updateSyncStatus({ pendingCount: 5 });
			expect(syncState.pendingCount).toBe(5);
		});

		it('should update multiple properties', () => {
			const now = new Date();
			updateSyncStatus({
				pendingCount: 2,
				syncInProgress: true,
				lastSyncAttempt: now
			});
			expect(syncState.pendingCount).toBe(2);
			expect(syncState.syncInProgress).toBe(true);
			expect(syncState.lastSyncAttempt).toBe(now);
		});
	});

	describe('setSyncInProgress', () => {
		it('should set sync in progress and update lastSyncAttempt', () => {
			const before = new Date();
			setSyncInProgress(true);
			const after = new Date();

			expect(syncState.syncInProgress).toBe(true);
			expect(syncState.lastSyncAttempt).toBeDefined();
			expect(syncState.lastSyncAttempt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(syncState.lastSyncAttempt!.getTime()).toBeLessThanOrEqual(after.getTime());
		});

		it('should set sync not in progress without changing lastSyncAttempt', () => {
			const now = new Date();
			updateSyncStatus({ lastSyncAttempt: now });
			setSyncInProgress(false);

			expect(syncState.syncInProgress).toBe(false);
			expect(syncState.lastSyncAttempt).toBe(now);
		});
	});

	describe('markSyncSuccessful', () => {
		it('should update lastSuccessfulSync and set syncInProgress to false', () => {
			updateSyncStatus({ syncInProgress: true });
			const before = new Date();
			markSyncSuccessful();
			const after = new Date();

			expect(syncState.syncInProgress).toBe(false);
			expect(syncState.lastSuccessfulSync).toBeDefined();
			expect(syncState.lastSuccessfulSync!.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(syncState.lastSuccessfulSync!.getTime()).toBeLessThanOrEqual(after.getTime());
		});
	});

	describe('incrementPendingSyncs', () => {
		it('should increment pending count', () => {
			updateSyncStatus({ pendingCount: 0 });
			incrementPendingSyncs();
			expect(syncState.pendingCount).toBe(1);
		});

		it('should increment multiple times', () => {
			updateSyncStatus({ pendingCount: 0 });
			incrementPendingSyncs();
			incrementPendingSyncs();
			incrementPendingSyncs();
			expect(syncState.pendingCount).toBe(3);
		});
	});

	describe('decrementPendingSyncs', () => {
		it('should decrement pending count', () => {
			updateSyncStatus({ pendingCount: 3 });
			decrementPendingSyncs();
			expect(syncState.pendingCount).toBe(2);
		});

		it('should not go below zero', () => {
			updateSyncStatus({ pendingCount: 0 });
			decrementPendingSyncs();
			expect(syncState.pendingCount).toBe(0);
		});
	});

	describe('initConnectionMonitoring', () => {
		it('should add event listeners', () => {
			const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

			initConnectionMonitoring();

			expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
			expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
		});

		it('should handle missing Network Information API gracefully', () => {
			// Remove connection property if it exists
			const originalConnection = (navigator as Navigator & { connection?: unknown }).connection;
			delete (navigator as Navigator & { connection?: unknown }).connection;

			expect(() => initConnectionMonitoring()).not.toThrow();

			// Restore
			(navigator as Navigator & { connection?: unknown }).connection = originalConnection;
		});
	});

	describe('cleanupConnectionMonitoring', () => {
		it('should remove event listeners', () => {
			const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

			initConnectionMonitoring();
			cleanupConnectionMonitoring();

			expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
		});
	});

	describe('connectionState', () => {
		it('should have initial default values', () => {
			expect(connectionState.online).toBe(true);
			expect(connectionState.connectionType).toBeNull();
			expect(connectionState.effectiveType).toBeNull();
			expect(connectionState.downlink).toBeNull();
			expect(connectionState.rtt).toBeNull();
		});
	});
});
