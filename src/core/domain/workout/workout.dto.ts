/**
 * DTOs for Workout domain
 */

export interface CreateWorkoutLogDto {
	userId: string;
	splitId: string;
	dayId: string;
	duration?: number | null;
	notes?: string | null;
	completedAt: Date;
	exercises: CreateExerciseLogDto[];
}

export interface CreateExerciseLogDto {
	exerciseId: string;
	sets: number;
	reps: string;
	weight?: number | null;
	notes?: string | null;
}

export interface UpdateWorkoutLogDto {
	duration?: number | null;
	notes?: string | null;
}

export interface WorkoutLogWithDetailsDto {
	id: string;
	userId: string;
	splitId: string;
	dayId: string;
	duration: number | null;
	notes: string | null;
	completedAt: Date;
	split: {
		id: string;
		title: string;
	};
	day: {
		id: string;
		name: string;
		dayNumber: number;
	};
	exercises: ExerciseLogWithDetailsDto[];
	createdAt: Date;
}

export interface ExerciseLogWithDetailsDto {
	id: string;
	workoutLogId: string;
	exerciseId: string;
	sets: number;
	reps: string;
	weight: number | null;
	notes: string | null;
	exercise: {
		id: string;
		name: string;
		muscleGroup: string;
	};
	createdAt: Date;
}

export interface PersonalRecordDto {
	id: string;
	userId: string;
	exerciseId: string;
	weight: number;
	reps: number;
	achievedAt: Date;
	exercise: {
		id: string;
		name: string;
		muscleGroup: string;
	};
	oneRepMax: number;
}

export interface WorkoutStatsDto {
	totalWorkouts: number;
	totalDuration: number;
	averageDuration: number;
	lastWorkoutDate: Date | null;
	currentStreak: number;
}
