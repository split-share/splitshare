import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	queueAction,
	syncPendingData,
	syncWorkoutSession,
	pullDataFromServer,
	initializeSync
} from '$lib/services/sync.service';
import { db, type LocalWorkoutSession } from '$lib/db/indexeddb';
import { syncState, updateSyncStatus } from '$lib/stores/connection.svelte';

describe('Sync Service', () => {
	beforeEach(async () => {
		// Clear all tables
		await db.pendingActions.clear();
		await db.failedActions.clear();
		await db.workoutSessions.clear();
		await db.splits.clear();
		await db.exercises.clear();
		await db.splitDays.clear();
		await db.dayExercises.clear();
		await db.personalRecords.clear();
		await db.weightEntries.clear();

		// Reset sync state
		updateSyncStatus({
			pendingCount: 0,
			lastSyncAttempt: null,
			lastSuccessfulSync: null,
			syncInProgress: false
		});

		// Reset fetch mock
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('queueAction', () => {
		it('should queue an action for sync', async () => {
			await queueAction('create', 'workoutSession', 'session-1', { test: 'data' });

			const actions = await db.pendingActions.toArray();
			expect(actions).toHaveLength(1);
			expect(actions[0].action).toBe('create');
			expect(actions[0].entityType).toBe('workoutSession');
			expect(actions[0].entityId).toBe('session-1');
			expect(syncState.pendingCount).toBe(1);
		});

		it('should generate unique IDs for each action', async () => {
			await queueAction('create', 'workoutSession', 'session-1', {});
			await queueAction('create', 'workoutSession', 'session-2', {});

			const actions = await db.pendingActions.toArray();
			expect(actions).toHaveLength(2);
			expect(actions[0].id).not.toBe(actions[1].id);
		});
	});

	describe('syncPendingData', () => {
		it('should sync pending actions successfully', async () => {
			// Setup mock fetch
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200
			});

			// Add pending actions
			await db.pendingActions.add({
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: { title: 'Test Session' },
				createdAt: new Date(),
				retryCount: 0
			});

			updateSyncStatus({ pendingCount: 1 });

			await syncPendingData();

			// Verify action was removed from pending
			const pendingActions = await db.pendingActions.toArray();
			expect(pendingActions).toHaveLength(0);

			// Verify fetch was called with correct parameters
			expect(fetch).toHaveBeenCalledWith(
				'/api/workout/session',
				expect.objectContaining({
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({ title: 'Test Session' })
				})
			);
		});

		it('should handle sync failures and retry', async () => {
			// Setup mock fetch to fail
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			});

			await db.pendingActions.add({
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: {},
				createdAt: new Date(),
				retryCount: 0
			});

			updateSyncStatus({ pendingCount: 1 });

			await expect(syncPendingData()).rejects.toThrow();

			// Action should still be pending with incremented retry count
			const action = await db.pendingActions.get('action-1');
			expect(action).toBeDefined();
			expect(action?.retryCount).toBe(1);
		});

		it('should move action to failed queue after max retries', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500
			});

			await db.pendingActions.add({
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: {},
				createdAt: new Date(),
				retryCount: 2 // Already retried twice
			});

			updateSyncStatus({ pendingCount: 1 });

			await syncPendingData();

			// Action should be moved to failed queue
			const pendingAction = await db.pendingActions.get('action-1');
			expect(pendingAction).toBeUndefined();

			const failedAction = await db.failedActions.get('action-1');
			expect(failedAction).toBeDefined();
			expect(failedAction?.error).toBe('Max retries exceeded');
		});

		it('should prioritize workout sessions over other entities', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200
			});

			const callOrder: string[] = [];
			vi.mocked(fetch).mockImplementation(async (url: string | Request | URL) => {
				const urlString = typeof url === 'string' ? url : url.toString();
				callOrder.push(urlString);
				return { ok: true, status: 200 } as Response;
			});

			// Add actions in reverse priority order
			await db.pendingActions.bulkAdd([
				{
					id: 'action-1',
					action: 'create',
					entityType: 'splitDay',
					entityId: 'day-1',
					data: {},
					createdAt: new Date(),
					retryCount: 0
				},
				{
					id: 'action-2',
					action: 'create',
					entityType: 'workoutSession',
					entityId: 'session-1',
					data: {},
					createdAt: new Date(),
					retryCount: 0
				},
				{
					id: 'action-3',
					action: 'create',
					entityType: 'exercise',
					entityId: 'exercise-1',
					data: {},
					createdAt: new Date(),
					retryCount: 0
				}
			]);

			updateSyncStatus({ pendingCount: 3 });
			await syncPendingData();

			// Workout session should be processed first
			expect(callOrder[0]).toBe('/api/workout/session');
		});

		it('should prevent concurrent sync operations', async () => {
			global.fetch = vi.fn().mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve({ ok: true, status: 200 }), 100);
					})
			);

			await db.pendingActions.add({
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: {},
				createdAt: new Date(),
				retryCount: 0
			});

			updateSyncStatus({ pendingCount: 1 });

			// Start first sync
			const sync1 = syncPendingData();
			// Try to start second sync immediately
			const sync2 = syncPendingData();

			await Promise.all([sync1, sync2]);

			// Fetch should only be called once due to lock
			expect(fetch).toHaveBeenCalledTimes(1);
		});

		it('should handle authentication errors', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized'
			});

			await db.pendingActions.add({
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: {},
				createdAt: new Date(),
				retryCount: 0
			});

			updateSyncStatus({ pendingCount: 1 });

			await expect(syncPendingData()).rejects.toThrow();
		});
	});

	describe('syncWorkoutSession', () => {
		it('should sync workout session and mark as clean', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200
			});

			const session: LocalWorkoutSession = {
				id: 'session-1',
				userId: 'user-1',
				splitId: 'split-1',
				dayId: 'day-1',
				currentExerciseIndex: 1,
				currentSetIndex: 2,
				phase: 'exercise',
				exerciseElapsedSeconds: 120,
				restRemainingSeconds: null,
				pausedAt: null,
				completedSets: [],
				startedAt: new Date(),
				completedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				isDirty: true
			};

			await db.workoutSessions.add(session);
			await syncWorkoutSession(session);

			// Verify fetch was called with session data
			expect(fetch).toHaveBeenCalledWith(
				'/api/workout/sync',
				expect.objectContaining({
					method: 'POST',
					credentials: 'include',
					body: expect.stringContaining('session-1')
				})
			);

			// Verify session is marked as clean
			const updatedSession = await db.workoutSessions.get('session-1');
			expect(updatedSession?.isDirty).toBe(false);
			expect(updatedSession?.lastSyncedAt).toBeDefined();
		});

		it('should queue action when sync fails', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500
			});

			const session: LocalWorkoutSession = {
				id: 'session-1',
				userId: 'user-1',
				splitId: 'split-1',
				dayId: 'day-1',
				currentExerciseIndex: 0,
				currentSetIndex: 0,
				phase: 'exercise',
				exerciseElapsedSeconds: 0,
				restRemainingSeconds: null,
				pausedAt: null,
				completedSets: [],
				startedAt: new Date(),
				completedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				isDirty: true
			};

			await syncWorkoutSession(session);

			// Verify action was queued
			const actions = await db.pendingActions.toArray();
			expect(actions).toHaveLength(1);
			expect(actions[0].entityType).toBe('workoutSession');
		});
	});

	describe('pullDataFromServer', () => {
		it('should fetch and store data from server', async () => {
			const mockSplits = [{ id: 'split-1', title: 'Test Split', userId: 'user-1' }];
			const mockExercises = [{ id: 'exercise-1', name: 'Bench Press', muscleGroup: 'chest' }];

			global.fetch = vi.fn().mockImplementation((url: string | Request | URL) => {
				const urlString = typeof url === 'string' ? url : url.toString();
				if (urlString === '/api/splits') {
					return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSplits) });
				}
				if (urlString === '/api/exercises') {
					return Promise.resolve({ ok: true, json: () => Promise.resolve(mockExercises) });
				}
				return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
			});

			await pullDataFromServer();

			// Verify data was stored
			const splits = await db.splits.toArray();
			expect(splits).toHaveLength(1);
			expect(splits[0].id).toBe('split-1');

			const exercises = await db.exercises.toArray();
			expect(exercises).toHaveLength(1);
			expect(exercises[0].id).toBe('exercise-1');
		});

		it('should remove stale data when syncing splits', async () => {
			// Add existing splits
			await db.splits.bulkAdd([
				{
					id: 'old-split-1',
					title: 'Old Split',
					userId: 'user-1',
					difficulty: 'beginner',
					isPublic: false,
					isTemplate: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					lastSyncedAt: new Date()
				},
				{
					id: 'split-1',
					title: 'Current Split',
					userId: 'user-1',
					difficulty: 'intermediate',
					isPublic: false,
					isTemplate: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					lastSyncedAt: new Date()
				}
			]);

			// Server returns only the current split
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 'split-1', title: 'Current Split', userId: 'user-1' }])
			});

			await pullDataFromServer();

			// Old split should be deleted
			const splits = await db.splits.toArray();
			expect(splits).toHaveLength(1);
			expect(splits[0].id).toBe('split-1');
		});
	});

	describe('initializeSync', () => {
		it('should not sync when offline', async () => {
			// Mock navigator.onLine
			Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

			global.fetch = vi.fn();

			await initializeSync();

			expect(fetch).not.toHaveBeenCalled();
		});
	});
});
