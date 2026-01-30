import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db, type LocalWorkoutSession, type PendingAction } from '$lib/db/indexeddb';

describe('IndexedDB', () => {
	beforeEach(async () => {
		// Clear all tables before each test
		await db.workoutSessions.clear();
		await db.pendingActions.clear();
		await db.exercises.clear();
		await db.splits.clear();
		await db.apiCache.clear();
		await db.failedActions.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('WorkoutSessions', () => {
		it('should add a workout session', async () => {
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

			await db.workoutSessions.add(session);
			const result = await db.workoutSessions.get('session-1');

			expect(result).toBeDefined();
			expect(result?.id).toBe('session-1');
			expect(result?.userId).toBe('user-1');
			expect(result?.isDirty).toBe(true);
		});

		it('should update a workout session', async () => {
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

			await db.workoutSessions.add(session);
			await db.workoutSessions.update('session-1', {
				currentExerciseIndex: 1,
				isDirty: false,
				lastSyncedAt: new Date()
			});

			const result = await db.workoutSessions.get('session-1');
			expect(result?.currentExerciseIndex).toBe(1);
			expect(result?.isDirty).toBe(false);
			expect(result?.lastSyncedAt).toBeDefined();
		});

		it('should query sessions by userId', async () => {
			const sessions: LocalWorkoutSession[] = [
				{
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
				},
				{
					id: 'session-2',
					userId: 'user-1',
					splitId: 'split-2',
					dayId: 'day-2',
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
					isDirty: false
				},
				{
					id: 'session-3',
					userId: 'user-2',
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
				}
			];

			await db.workoutSessions.bulkAdd(sessions);
			const user1Sessions = await db.workoutSessions.where('userId').equals('user-1').toArray();

			expect(user1Sessions).toHaveLength(2);
			expect(user1Sessions.map((s) => s.id)).toContain('session-1');
			expect(user1Sessions.map((s) => s.id)).toContain('session-2');
		});

		it('should query dirty sessions', async () => {
			const sessions: LocalWorkoutSession[] = [
				{
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
				},
				{
					id: 'session-2',
					userId: 'user-1',
					splitId: 'split-2',
					dayId: 'day-2',
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
					isDirty: false
				}
			];

			await db.workoutSessions.bulkAdd(sessions);
			// Query using filter since fake-indexeddb handles booleans differently
			const allSessions = await db.workoutSessions.toArray();
			const dirtySessions = allSessions.filter((s: LocalWorkoutSession) => s.isDirty === true);

			expect(dirtySessions).toHaveLength(1);
			expect(dirtySessions[0].id).toBe('session-1');
		});
	});

	describe('PendingActions', () => {
		it('should add a pending action', async () => {
			const action: PendingAction = {
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: { test: 'data' },
				createdAt: new Date(),
				retryCount: 0
			};

			await db.pendingActions.add(action);
			const result = await db.pendingActions.get('action-1');

			expect(result).toBeDefined();
			expect(result?.action).toBe('create');
			expect(result?.entityType).toBe('workoutSession');
		});

		it('should query actions by entity type', async () => {
			const actions: PendingAction[] = [
				{
					id: 'action-1',
					action: 'create',
					entityType: 'workoutSession',
					entityId: 'session-1',
					data: {},
					createdAt: new Date(),
					retryCount: 0
				},
				{
					id: 'action-2',
					action: 'update',
					entityType: 'exercise',
					entityId: 'exercise-1',
					data: {},
					createdAt: new Date(),
					retryCount: 0
				},
				{
					id: 'action-3',
					action: 'delete',
					entityType: 'workoutSession',
					entityId: 'session-2',
					data: {},
					createdAt: new Date(),
					retryCount: 0
				}
			];

			await db.pendingActions.bulkAdd(actions);
			const workoutActions = await db.pendingActions
				.where('entityType')
				.equals('workoutSession')
				.toArray();

			expect(workoutActions).toHaveLength(2);
		});

		it('should update retry count', async () => {
			const action: PendingAction = {
				id: 'action-1',
				action: 'create',
				entityType: 'workoutSession',
				entityId: 'session-1',
				data: {},
				createdAt: new Date(),
				retryCount: 0
			};

			await db.pendingActions.add(action);
			await db.pendingActions.update('action-1', { retryCount: 1 });

			const result = await db.pendingActions.get('action-1');
			expect(result?.retryCount).toBe(1);
		});
	});

	describe('API Cache', () => {
		it('should cache API responses', async () => {
			const cacheEntry = {
				endpoint: '/api/splits',
				data: { splits: [{ id: '1', title: 'Test' }] },
				expires: Date.now() + 5 * 60 * 1000,
				cachedAt: new Date()
			};

			await db.apiCache.put(cacheEntry);
			const result = await db.apiCache.get('/api/splits');

			expect(result).toBeDefined();
			expect(result?.endpoint).toBe('/api/splits');
			expect(result?.data).toEqual({ splits: [{ id: '1', title: 'Test' }] });
		});

		it('should delete expired cache entries', async () => {
			const expiredEntry = {
				endpoint: '/api/expired',
				data: { test: 'data' },
				expires: Date.now() - 1000, // Expired 1 second ago
				cachedAt: new Date()
			};

			await db.apiCache.put(expiredEntry);

			// Query should return the entry
			const result = await db.apiCache.get('/api/expired');
			expect(result).toBeDefined();

			// Delete expired entries
			const now = Date.now();
			const expiredKeys = await db.apiCache.where('expires').below(now).primaryKeys();
			await db.apiCache.bulkDelete(expiredKeys);

			// Should be deleted
			const afterDelete = await db.apiCache.get('/api/expired');
			expect(afterDelete).toBeUndefined();
		});
	});

	describe('FailedActions', () => {
		it('should add failed action to dead letter queue', async () => {
			const failedAction = {
				id: 'failed-1',
				action: 'create' as const,
				entityType: 'workoutSession' as const,
				entityId: 'session-1',
				data: {},
				createdAt: new Date(),
				retryCount: 3,
				failedAt: new Date(),
				error: 'Max retries exceeded'
			};

			await db.failedActions.add(failedAction);
			const result = await db.failedActions.get('failed-1');

			expect(result).toBeDefined();
			expect(result?.error).toBe('Max retries exceeded');
		});
	});
});
