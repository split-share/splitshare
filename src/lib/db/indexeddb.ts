import Dexie, { type Table } from 'dexie';

/**
 * Exercise entity for local storage
 */
export interface LocalExercise {
	id: string;
	name: string;
	muscleGroup: string;
	equipment?: string | null;
	difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
	instructions?: string | null;
	gifUrl?: string | null;
	isPublic: boolean;
	createdBy?: string | null;
	createdAt: Date;
	updatedAt: Date;
	lastSyncedAt?: Date;
}

/**
 * Split entity for local storage
 */
export interface LocalSplit {
	id: string;
	userId: string;
	title: string;
	description?: string | null;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	isPublic: boolean;
	isTemplate: boolean;
	tags?: string[];
	createdAt: Date;
	updatedAt: Date;
	lastSyncedAt?: Date;
}

/**
 * SplitDay entity for local storage
 */
export interface LocalSplitDay {
	id: string;
	splitId: string;
	name: string;
	dayOrder: number;
	createdAt: Date;
	updatedAt: Date;
	lastSyncedAt?: Date;
}

/**
 * DayExercise entity for local storage
 */
export interface LocalDayExercise {
	id: string;
	dayId: string;
	exerciseId: string;
	exerciseOrder: number;
	sets: number;
	reps?: string | null;
	restSeconds?: number | null;
	notes?: string | null;
	createdAt: Date;
	updatedAt: Date;
	lastSyncedAt?: Date;
}

/**
 * Completed set data within a workout session
 */
export interface CompletedSetData {
	exerciseIndex: number;
	setIndex: number;
	reps: number;
	weight: number;
	completedAt: Date;
}

/**
 * WorkoutSession entity for local storage (critical for offline)
 */
export interface LocalWorkoutSession {
	id: string;
	userId: string;
	splitId: string;
	dayId: string;
	currentExerciseIndex: number;
	currentSetIndex: number;
	phase: 'exercise' | 'rest' | 'completed';
	exerciseElapsedSeconds: number;
	restRemainingSeconds: number | null;
	pausedAt: Date | null;
	completedSets: CompletedSetData[];
	startedAt: Date;
	completedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
	lastSyncedAt?: Date;
	isDirty: boolean; // Track if local changes need sync
}

/**
 * PersonalRecord entity for local storage
 */
export interface LocalPersonalRecord {
	id: string;
	userId: string;
	exerciseId: string;
	weight: number;
	reps: number;
	date: Date;
	createdAt: Date;
	lastSyncedAt?: Date;
	isDirty: boolean;
}

/**
 * WeightEntry entity for local storage
 */
export interface LocalWeightEntry {
	id: string;
	userId: string;
	weight: number;
	date: Date;
	notes?: string | null;
	createdAt: Date;
	lastSyncedAt?: Date;
	isDirty: boolean;
}

/**
 * Pending action queue for offline operations
 */
export interface PendingAction {
	id: string;
	action: 'create' | 'update' | 'delete';
	entityType:
		| 'split'
		| 'exercise'
		| 'workoutSession'
		| 'personalRecord'
		| 'weightEntry'
		| 'dayExercise'
		| 'splitDay';
	entityId: string;
	data: Record<string, unknown>;
	createdAt: Date;
	retryCount: number;
}

/**
 * SplitShare IndexedDB Database
 * Stores critical fitness data for offline use
 */
/**
 * API cache entry for offline GET request support
 */
export interface ApiCacheEntry {
	endpoint: string;
	data: unknown;
	expires: number;
	cachedAt: Date;
}

/**
 * Failed action for dead letter queue
 */
export interface FailedAction extends PendingAction {
	failedAt: Date;
	error: string;
}

export class SplitShareDatabase extends Dexie {
	exercises!: Table<LocalExercise>;
	splits!: Table<LocalSplit>;
	splitDays!: Table<LocalSplitDay>;
	dayExercises!: Table<LocalDayExercise>;
	workoutSessions!: Table<LocalWorkoutSession>;
	personalRecords!: Table<LocalPersonalRecord>;
	weightEntries!: Table<LocalWeightEntry>;
	pendingActions!: Table<PendingAction>;
	failedActions!: Table<FailedAction>;
	apiCache!: Table<ApiCacheEntry>;

	constructor() {
		super('SplitShareDB');

		this.version(1).stores({
			exercises: 'id, name, muscleGroup, isPublic, createdBy, createdAt, updatedAt, lastSyncedAt',
			splits:
				'id, userId, title, difficulty, isPublic, isTemplate, createdAt, updatedAt, lastSyncedAt',
			splitDays: 'id, splitId, name, dayOrder, createdAt, updatedAt, lastSyncedAt',
			dayExercises: 'id, dayId, exerciseId, exerciseOrder, createdAt, updatedAt, lastSyncedAt',
			workoutSessions:
				'id, userId, splitId, dayId, phase, startedAt, completedAt, updatedAt, isDirty, lastSyncedAt',
			personalRecords: 'id, userId, exerciseId, date, createdAt, isDirty, lastSyncedAt',
			weightEntries: 'id, userId, date, createdAt, isDirty, lastSyncedAt',
			pendingActions: 'id, action, entityType, entityId, createdAt, retryCount',
			failedActions: 'id, action, entityType, entityId, failedAt',
			apiCache: 'endpoint, expires'
		});
	}
}

/**
 * Singleton database instance
 */
export const db = new SplitShareDatabase();

/**
 * Check if IndexedDB is available in the current environment
 */
export function isIndexedDBAvailable(): boolean {
	return typeof window !== 'undefined' && 'indexedDB' in window;
}
