/**
 * Network connection status using Svelte 5 runes
 */
export interface ConnectionStatus {
	online: boolean;
	connectionType: string | null;
	effectiveType: string | null;
	downlink: number | null;
	rtt: number | null;
}

/**
 * Service worker registration status
 */
export interface ServiceWorkerStatus {
	registered: boolean;
	updateAvailable: boolean;
	offlineReady: boolean;
}

/**
 * Pending sync status
 */
export interface PendingSyncStatus {
	pendingCount: number;
	lastSyncAttempt: Date | null;
	lastSuccessfulSync: Date | null;
	syncInProgress: boolean;
}

/**
 * Connection state store class - uses $state for reactive properties
 * This approach allows mutation without reassignment, avoiding the
 * Svelte 5 "Cannot export state from a module if it is reassigned" error
 */
class ConnectionStateStore implements ConnectionStatus {
	online = $state(true);
	connectionType = $state<string | null>(null);
	effectiveType = $state<string | null>(null);
	downlink = $state<number | null>(null);
	rtt = $state<number | null>(null);

	update(nav: Navigator & { connection?: NetworkInformation }): void {
		const connection = nav.connection;
		this.online = navigator.onLine;
		this.connectionType = connection?.type ?? null;
		this.effectiveType = (connection?.effectiveType as string) ?? null;
		this.downlink = connection?.downlink ?? null;
		this.rtt = connection?.rtt ?? null;
	}
}

/**
 * Service worker state store class
 */
class ServiceWorkerStateStore implements ServiceWorkerStatus {
	registered = $state(false);
	updateAvailable = $state(false);
	offlineReady = $state(false);

	update(status: Partial<ServiceWorkerStatus>): void {
		if (status.registered !== undefined) this.registered = status.registered;
		if (status.updateAvailable !== undefined) this.updateAvailable = status.updateAvailable;
		if (status.offlineReady !== undefined) this.offlineReady = status.offlineReady;
	}
}

/**
 * Sync state store class
 */
class SyncStateStore implements PendingSyncStatus {
	pendingCount = $state(0);
	lastSyncAttempt = $state<Date | null>(null);
	lastSuccessfulSync = $state<Date | null>(null);
	syncInProgress = $state(false);

	update(status: Partial<PendingSyncStatus>): void {
		if (status.pendingCount !== undefined) this.pendingCount = status.pendingCount;
		if (status.lastSyncAttempt !== undefined) this.lastSyncAttempt = status.lastSyncAttempt;
		if (status.lastSuccessfulSync !== undefined)
			this.lastSuccessfulSync = status.lastSuccessfulSync;
		if (status.syncInProgress !== undefined) this.syncInProgress = status.syncInProgress;
	}

	setInProgress(inProgress: boolean): void {
		this.syncInProgress = inProgress;
		if (inProgress) {
			this.lastSyncAttempt = new Date();
		}
	}

	markSuccessful(): void {
		this.lastSuccessfulSync = new Date();
		this.syncInProgress = false;
	}

	increment(): void {
		this.pendingCount++;
	}

	decrement(): void {
		this.pendingCount = Math.max(0, this.pendingCount - 1);
	}
}

// Create singleton instances
const connectionState = new ConnectionStateStore();
const serviceWorkerState = new ServiceWorkerStateStore();
const syncState = new SyncStateStore();

// Export individual state objects for granular access
export { connectionState, serviceWorkerState, syncState };

// Derived states - exported as getter functions since $derived cannot be exported from modules
export function getIsOnline(): boolean {
	return connectionState.online;
}

export function getIsOfflineReady(): boolean {
	return serviceWorkerState.registered && serviceWorkerState.offlineReady;
}

export function getHasPendingSyncs(): boolean {
	return syncState.pendingCount > 0;
}

// Backwards compatible aliases (for use in components with $derived)
export const isOnline = {
	get current() {
		return connectionState.online;
	}
};

export const isOfflineReady = {
	get current() {
		return serviceWorkerState.registered && serviceWorkerState.offlineReady;
	}
};

export const hasPendingSyncs = {
	get current() {
		return syncState.pendingCount > 0;
	}
};

/**
 * Initialize connection monitoring
 * Sets up listeners for online/offline events and Network Information API
 */
export function initConnectionMonitoring(): void {
	if (typeof window === 'undefined') return;

	// Initial state
	updateConnectionStatus();

	// Listen for online/offline events
	window.addEventListener('online', updateConnectionStatus);
	window.addEventListener('offline', updateConnectionStatus);

	// Listen for connection changes (if Network Information API is available)
	const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
	if (connection) {
		connection.addEventListener('change', updateConnectionStatus);
	}
}

/**
 * Update connection status based on current network state
 */
function updateConnectionStatus(): void {
	if (typeof window === 'undefined') return;

	const nav = navigator as Navigator & { connection?: NetworkInformation };
	connectionState.update(nav);
}

/**
 * Update service worker status
 */
export function updateServiceWorkerStatus(status: Partial<ServiceWorkerStatus>): void {
	serviceWorkerState.update(status);
}

/**
 * Update sync status
 */
export function updateSyncStatus(status: Partial<PendingSyncStatus>): void {
	syncState.update(status);
}

/**
 * Set sync in progress
 */
export function setSyncInProgress(inProgress: boolean): void {
	syncState.setInProgress(inProgress);
}

/**
 * Mark sync as successful
 */
export function markSyncSuccessful(): void {
	syncState.markSuccessful();
}

/**
 * Increment pending sync count
 */
export function incrementPendingSyncs(): void {
	syncState.increment();
}

/**
 * Decrement pending sync count
 */
export function decrementPendingSyncs(): void {
	syncState.decrement();
}

/**
 * Cleanup connection monitoring listeners
 */
export function cleanupConnectionMonitoring(): void {
	if (typeof window === 'undefined') return;

	window.removeEventListener('online', updateConnectionStatus);
	window.removeEventListener('offline', updateConnectionStatus);

	const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
	if (connection) {
		connection.removeEventListener('change', updateConnectionStatus);
	}
}

// Network Information API type (not fully standardized)
interface NetworkInformation {
	type: string;
	effectiveType: string;
	downlink: number;
	rtt: number;
	addEventListener(type: string, listener: EventListener): void;
	removeEventListener(type: string, listener: EventListener): void;
}
