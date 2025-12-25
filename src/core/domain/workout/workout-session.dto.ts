/**
 * DTOs for WorkoutSession domain
 */

import type { CompletedSetData, WorkoutPhase } from './workout-session.entity';

export interface CreateWorkoutSessionDto {
	userId: string;
	splitId: string;
	dayId: string;
}

export interface UpdateWorkoutSessionDto {
	currentExerciseIndex?: number;
	currentSetIndex?: number;
	phase?: WorkoutPhase;
	exerciseElapsedSeconds?: number;
	restRemainingSeconds?: number | null;
	pausedAt?: Date | null;
	lastUpdatedAt?: Date;
	completedSets?: CompletedSetData[];
}

export interface DayExerciseDto {
	id: string;
	exerciseId: string | null;
	exerciseName: string;
	sets: number;
	reps: string;
	restTime: number | null;
	weight: string | null;
	notes: string | null;
	order: number;
	exercise: {
		id: string;
		name: string;
		description: string | null;
		muscleGroup: string;
		equipmentType: string;
		difficulty: string;
		imageUrl: string | null;
		videoUrl: string | null;
	} | null;
}

export interface WorkoutSessionWithDetailsDto {
	session: {
		id: string;
		userId: string;
		splitId: string;
		dayId: string;
		currentExerciseIndex: number;
		currentSetIndex: number;
		phase: WorkoutPhase;
		exerciseElapsedSeconds: number;
		restRemainingSeconds: number | null;
		startedAt: Date;
		pausedAt: Date | null;
		lastUpdatedAt: Date;
		completedSets: CompletedSetData[];
		createdAt: Date;
	};
	split: {
		id: string;
		title: string;
	};
	day: {
		id: string;
		name: string;
		dayNumber: number;
	};
	exercises: DayExerciseDto[];
}
