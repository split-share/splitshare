/**
 * DTOs for Progressive Overload suggestions
 */

export interface ExercisePerformanceDto {
	date: Date;
	weight: number | null;
	sets: number;
	reps: string;
}

export interface ProgressionSuggestionDto {
	exerciseId: string;
	exerciseName: string;
	muscleGroup: string;
	currentPR: { weight: number; reps: number; date: Date } | null;
	lastPerformance: { weight: number | null; reps: string; date: Date } | null;
	recentPerformances: ExercisePerformanceDto[];
	suggestedWeight: number | null;
	increment: number;
	reason: 'ready_to_progress' | 'maintain' | 'no_history' | 'inconsistent';
	consecutiveSuccesses: number;
}

/**
 * Muscle groups that use larger increments (compound movements)
 */
export const COMPOUND_MUSCLE_GROUPS = [
	'chest',
	'back',
	'legs',
	'quadriceps',
	'hamstrings',
	'glutes'
];

/**
 * Default increment values in kg
 */
export const COMPOUND_INCREMENT = 2.5;
export const ISOLATION_INCREMENT = 1.25;

/**
 * Number of consecutive successful sessions required to suggest progression
 */
export const PROGRESSION_THRESHOLD = 2;
