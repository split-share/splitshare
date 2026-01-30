import { db, type PendingAction, type LocalWorkoutSession } from '$lib/db/indexeddb';
import {
	updateSyncStatus,
	setSyncInProgress,
	markSyncSuccessful,
	incrementPendingSyncs
} from '$lib/stores/connection.svelte';

/**
 * Sync priority levels for different entity types
 */
const SYNC_PRIORITY = {
	workoutSession: 1, // Highest priority - active workouts
	personalRecord: 2,
	weightEntry: 3,
	exercise: 4,
	split: 5,
	dayExercise: 6,
	splitDay: 7
} as const;

/**
 * Maximum number of sync retries before moving to failed queue
 */
const MAX_RETRY_COUNT = 3;

/**
 * Sync lock to prevent concurrent sync operations
 */
let isSyncLocked = false;

/**
 * Acquire sync lock
 */
function acquireSyncLock(): boolean {
	if (isSyncLocked) return false;
	isSyncLocked = true;
	return true;
}

/**
 * Release sync lock
 */
function releaseSyncLock(): void {
	isSyncLocked = false;
}

/**
 * Queue an action to be synced when online
 */
export async function queueAction(
	action: PendingAction['action'],
	entityType: PendingAction['entityType'],
	entityId: string,
	data: Record<string, unknown>
): Promise<void> {
	await db.pendingActions.add({
		id: crypto.randomUUID(),
		action,
		entityType,
		entityId,
		data,
		createdAt: new Date(),
		retryCount: 0
	});

	incrementPendingSyncs();

	// Attempt to trigger background sync if available
	if ('serviceWorker' in navigator && 'SyncManager' in window) {
		const registration = await navigator.serviceWorker.ready;
		try {
			await (
				registration as ServiceWorkerRegistration & {
					sync: { register: (tag: string) => Promise<void> };
				}
			).sync.register('sync-workout-data');
		} catch {
			// Background sync not supported or failed, will retry manually
		}
	}
}

/**
 * Serialize workout session for sync queue
 */
function serializeWorkoutSession(session: LocalWorkoutSession): Record<string, unknown> {
	return {
		id: session.id,
		userId: session.userId,
		splitId: session.splitId,
		dayId: session.dayId,
		currentExerciseIndex: session.currentExerciseIndex,
		currentSetIndex: session.currentSetIndex,
		phase: session.phase,
		exerciseElapsedSeconds: session.exerciseElapsedSeconds,
		restRemainingSeconds: session.restRemainingSeconds,
		pausedAt: session.pausedAt,
		completedSets: session.completedSets,
		startedAt: session.startedAt,
		completedAt: session.completedAt
	};
}

/**
 * Sync all pending actions with the server
 */
export async function syncPendingData(): Promise<void> {
	// Try to acquire lock
	if (!acquireSyncLock()) {
		console.log('Sync already in progress, skipping');
		return;
	}

	try {
		const pendingActions = await db.pendingActions.toArray();

		if (pendingActions.length === 0) {
			return;
		}

		setSyncInProgress(true);

		// Sort by priority and then by creation time
		const sortedActions = pendingActions.sort((a, b) => {
			const priorityA = SYNC_PRIORITY[a.entityType];
			const priorityB = SYNC_PRIORITY[b.entityType];
			if (priorityA !== priorityB) {
				return priorityA - priorityB;
			}
			return a.createdAt.getTime() - b.createdAt.getTime();
		});

		// Process actions sequentially to avoid race conditions
		const failedActions: PendingAction[] = [];
		const successfulCount = { value: 0 };

		for (const action of sortedActions) {
			try {
				await syncAction(action);
				successfulCount.value++;
			} catch {
				// Increment retry count
				action.retryCount++;

				if (action.retryCount >= MAX_RETRY_COUNT) {
					// Move to failed actions table
					await db.table('failedActions').add({
						...action,
						failedAt: new Date(),
						error: 'Max retries exceeded'
					});
					await db.pendingActions.delete(action.id);
				} else {
					// Update retry count
					await db.pendingActions.update(action.id, { retryCount: action.retryCount });
					failedActions.push(action);
				}
			}
		}

		if (failedActions.length > 0) {
			throw new Error(
				`Failed to sync ${failedActions.length} items. ${successfulCount.value} succeeded.`
			);
		}

		markSyncSuccessful();
	} catch (error) {
		console.error('Sync failed:', error);
		throw error;
	} finally {
		setSyncInProgress(false);
		await updatePendingCount();
		releaseSyncLock();
	}
}

/**
 * Sync a single action with the server
 */
async function syncAction(action: PendingAction): Promise<void> {
	const endpoint = getEndpointForEntity(action.entityType);
	const method = getMethodForAction(action.action);

	const response = await fetch(endpoint, {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include', // Include cookies for authentication
		body: JSON.stringify(action.data)
	});

	if (!response.ok) {
		// Handle 401 - auth error
		if (response.status === 401) {
			throw new Error('Authentication required. Please log in again.');
		}
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	// Remove from pending queue on success
	await db.pendingActions.delete(action.id);
}

/**
 * Get the API endpoint for an entity type
 */
function getEndpointForEntity(entityType: PendingAction['entityType']): string {
	const endpoints: Record<PendingAction['entityType'], string> = {
		workoutSession: '/api/workout/session',
		personalRecord: '/api/personal-records',
		weightEntry: '/api/weight',
		exercise: '/api/exercises',
		split: '/api/splits',
		dayExercise: '/api/day-exercises',
		splitDay: '/api/split-days'
	};
	return endpoints[entityType];
}

/**
 * Get the HTTP method for an action type
 */
function getMethodForAction(action: PendingAction['action']): string {
	const methods: Record<PendingAction['action'], string> = {
		create: 'POST',
		update: 'PUT',
		delete: 'DELETE'
	};
	return methods[action];
}

/**
 * Update the pending count in the store
 */
async function updatePendingCount(): Promise<void> {
	const count = await db.pendingActions.count();
	updateSyncStatus({ pendingCount: count });
}

/**
 * Sync workout session data to server
 * Called periodically during active workouts
 */
export async function syncWorkoutSession(session: LocalWorkoutSession): Promise<void> {
	try {
		const response = await fetch('/api/workout/sync', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({
				sessionId: session.id,
				currentExerciseIndex: session.currentExerciseIndex,
				currentSetIndex: session.currentSetIndex,
				phase: session.phase,
				exerciseElapsedSeconds: session.exerciseElapsedSeconds,
				restRemainingSeconds: session.restRemainingSeconds,
				completedSets: session.completedSets,
				pausedAt: session.pausedAt
			})
		});

		if (!response.ok) {
			// Queue for retry if sync fails
			await queueAction('update', 'workoutSession', session.id, serializeWorkoutSession(session));
		} else {
			// Mark as synced in local DB
			await db.workoutSessions.update(session.id, {
				isDirty: false,
				lastSyncedAt: new Date()
			});
		}
	} catch {
		// Network error, queue for retry
		await queueAction('update', 'workoutSession', session.id, serializeWorkoutSession(session));
	}
}

/**
 * Pull latest data from server for offline use
 */
export async function pullDataFromServer(): Promise<void> {
	try {
		// Fetch user's splits
		const splitsResponse = await fetch('/api/splits', { credentials: 'include' });
		if (splitsResponse.ok) {
			const splits = await splitsResponse.json();
			// Get existing IDs to determine what to delete
			const existingIds = new Set(await db.splits.toCollection().primaryKeys());
			const newIds = new Set(splits.map((s: { id: string }) => s.id));

			// Delete splits that no longer exist on server
			const idsToDelete = [...existingIds].filter((id) => !newIds.has(id as string));
			if (idsToDelete.length > 0) {
				await db.splits.bulkDelete(idsToDelete as string[]);
			}

			await db.splits.bulkPut(
				splits.map((s: Record<string, unknown>) => ({
					...s,
					lastSyncedAt: new Date()
				}))
			);
		}

		// Fetch exercises
		const exercisesResponse = await fetch('/api/exercises', { credentials: 'include' });
		if (exercisesResponse.ok) {
			const exercises = await exercisesResponse.json();
			await db.exercises.bulkPut(
				exercises.map((e: Record<string, unknown>) => ({
					...e,
					lastSyncedAt: new Date()
				}))
			);
		}

		// Fetch split days
		const splitDaysResponse = await fetch('/api/split-days', { credentials: 'include' });
		if (splitDaysResponse.ok) {
			const splitDays = await splitDaysResponse.json();
			await db.splitDays.bulkPut(
				splitDays.map((sd: Record<string, unknown>) => ({
					...sd,
					lastSyncedAt: new Date()
				}))
			);
		}

		// Fetch day exercises
		const dayExercisesResponse = await fetch('/api/day-exercises', { credentials: 'include' });
		if (dayExercisesResponse.ok) {
			const dayExercises = await dayExercisesResponse.json();
			await db.dayExercises.bulkPut(
				dayExercises.map((de: Record<string, unknown>) => ({
					...de,
					lastSyncedAt: new Date()
				}))
			);
		}

		// Fetch personal records
		const prsResponse = await fetch('/api/personal-records', { credentials: 'include' });
		if (prsResponse.ok) {
			const prs = await prsResponse.json();
			await db.personalRecords.bulkPut(
				prs.map((pr: Record<string, unknown>) => ({
					...pr,
					lastSyncedAt: new Date()
				}))
			);
		}

		// Fetch weight entries
		const weightResponse = await fetch('/api/weight', { credentials: 'include' });
		if (weightResponse.ok) {
			const weights = await weightResponse.json();
			await db.weightEntries.bulkPut(
				weights.map((w: Record<string, unknown>) => ({
					...w,
					lastSyncedAt: new Date()
				}))
			);
		}

		markSyncSuccessful();
	} catch (error) {
		console.error('Failed to pull data from server:', error);
		throw error;
	}
}

/**
 * Initialize sync on app load
 * Pulls data from server and syncs any pending actions
 */
export async function initializeSync(): Promise<void> {
	if (!navigator.onLine) {
		return;
	}

	// Check if sync is already running
	if (!acquireSyncLock()) {
		console.log('Sync already in progress');
		return;
	}

	try {
		await pullDataFromServer();
		await syncPendingData();
	} catch (error) {
		console.error('Initial sync failed:', error);
	} finally {
		releaseSyncLock();
	}
}
