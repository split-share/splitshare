import { API_BASE_URL, IS_MOBILE_APP } from './config';
import { applyAction } from '$app/forms';
import type { SubmitFunction, ActionResult } from '@sveltejs/kit';
import { queueAction } from '$lib/services/sync.service';
import { db, type PendingAction } from '$lib/db/indexeddb';

type FetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	body?: unknown;
	headers?: Record<string, string>;
	/** Whether to queue this request for retry when offline */
	queueIfOffline?: boolean;
	/** Entity type for offline queueing */
	entityType?: PendingAction['entityType'];
	/** Entity ID for offline queueing */
	entityId?: string;
};

type OfflineCapableFetchOptions = FetchOptions & {
	/** Fallback data to return when offline for GET requests */
	fallbackData?: unknown;
};

/**
 * Check if we're currently online
 */
export function checkOnlineStatus(): boolean {
	return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Enhanced API request with offline support
 */
export async function apiRequest<T>(
	endpoint: string,
	options: OfflineCapableFetchOptions = {}
): Promise<T> {
	const {
		method = 'GET',
		body,
		headers = {},
		queueIfOffline = false,
		entityType,
		entityId,
		fallbackData
	} = options;

	// Check online status
	const online = checkOnlineStatus();

	// For GET requests when offline, try to return cached data
	if (method === 'GET' && !online) {
		// Try to get from IndexedDB cache first
		const cachedData = await getCachedData<T>(endpoint);
		if (cachedData) {
			return cachedData;
		}

		// Return fallback data if provided
		if (fallbackData !== undefined) {
			return fallbackData as T;
		}

		throw new Error('Offline - no cached data available');
	}

	// For modifying requests when offline
	if (!online && method !== 'GET') {
		if (queueIfOffline && entityType && entityId && (body || method === 'DELETE')) {
			// Queue for later sync
			const action = getActionFromMethod(method);
			await queueAction(action, entityType, entityId, body as Record<string, unknown>);

			// Return optimistic response
			return {
				success: true,
				queued: true,
				message: 'Queued for sync when online'
			} as T;
		}

		throw new Error(`Offline - ${method} request cannot be completed`);
	}

	// Online - proceed with normal request
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

	const config: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		credentials: 'include',
		signal: controller.signal
	};

	if (body) {
		config.body = JSON.stringify(body);
	}

	try {
		const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
		const response = await fetch(url, config);
		clearTimeout(timeoutId);

		if (!response.ok) {
			// Handle 401 - authentication error
			if (response.status === 401) {
				throw new Error('Authentication required. Please log in again.');
			}

			const errorData = await response.json().catch(() => null);
			const message =
				errorData && typeof errorData === 'object' && 'message' in errorData
					? String(errorData.message)
					: `HTTP ${response.status}`;
			throw new Error(message);
		}

		const data = await response.json();

		// Cache GET responses in IndexedDB
		if (method === 'GET') {
			await cacheData(endpoint, data);
		}

		return data;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Request timeout - please try again');
		}
		throw error;
	}
}

/**
 * Get action type from HTTP method
 */
function getActionFromMethod(method: string): PendingAction['action'] {
	switch (method) {
		case 'POST':
			return 'create';
		case 'PUT':
		case 'PATCH':
			return 'update';
		case 'DELETE':
			return 'delete';
		default:
			return 'update';
	}
}

/**
 * Get cached data from IndexedDB for an endpoint
 */
async function getCachedData<T>(endpoint: string): Promise<T | null> {
	try {
		const cacheEntry = await db.apiCache.get(endpoint);
		if (cacheEntry) {
			if (cacheEntry.expires > Date.now()) {
				return cacheEntry.data as T;
			} else {
				// Delete expired entry
				await db.apiCache.delete(endpoint);
			}
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Cache data in IndexedDB for an endpoint
 */
async function cacheData(endpoint: string, data: unknown): Promise<void> {
	try {
		const cacheEntry = {
			endpoint,
			data,
			expires: Date.now() + 5 * 60 * 1000, // 5 minute cache
			cachedAt: new Date()
		};
		await db.apiCache.put(cacheEntry);

		// Clean up expired entries periodically (5% chance)
		if (Math.random() < 0.05) {
			await cleanupExpiredCache();
		}
	} catch {
		// Silently fail - caching is not critical
	}
}

/**
 * Clean up expired cache entries
 */
async function cleanupExpiredCache(): Promise<void> {
	try {
		const now = Date.now();
		const expiredKeys = await db.apiCache.where('expires').below(now).primaryKeys();
		if (expiredKeys.length > 0) {
			await db.apiCache.bulkDelete(expiredKeys);
		}
	} catch {
		// Silently fail
	}
}

/**
 * Form action enhancer that works for both web and mobile.
 * On web: Uses SvelteKit's form actions normally
 * On mobile: Converts form submission to API call to backend server
 */
export function enhanceForm(options?: {
	onSubmit?: () => void;
	onResult?: (result: unknown) => void;
	onError?: (error: string) => void;
}): SubmitFunction {
	return async ({ action, formData, cancel }) => {
		if (options?.onSubmit) {
			options.onSubmit();
		}

		// On mobile, intercept and send to API backend
		if (IS_MOBILE_APP) {
			cancel();

			try {
				const body: Record<string, unknown> = {};
				formData.forEach((value, key) => {
					body[key] = value;
				});

				const actionUrl = new URL(action);
				const endpoint = actionUrl.pathname + actionUrl.search;

				const response = await fetch(`${API_BASE_URL}${endpoint}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include',
					body: JSON.stringify(body)
				});

				const result = await response.json();

				if (response.ok) {
					if (options?.onResult) {
						options.onResult(result);
					}
					const successResult: ActionResult = {
						type: 'success',
						status: response.status,
						data: result
					};
					await applyAction(successResult);
				} else {
					if (options?.onError) {
						options.onError(result.message || 'Action failed');
					}
					const failureResult: ActionResult = {
						type: 'failure',
						status: response.status,
						data: result
					};
					await applyAction(failureResult);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Network error';
				if (options?.onError) {
					options.onError(message);
				}
				const errorResult: ActionResult = {
					type: 'error',
					error: new Error(message)
				};
				await applyAction(errorResult);
			}
		}

		return async ({ result }) => {
			if (result.type === 'success' && options?.onResult) {
				options.onResult(result.data);
			} else if (result.type === 'failure' && options?.onError) {
				options.onError(result.data?.message || 'Action failed');
			} else if (result.type === 'error' && options?.onError) {
				options.onError('An error occurred');
			}

			await applyAction(result);
		};
	};
}
