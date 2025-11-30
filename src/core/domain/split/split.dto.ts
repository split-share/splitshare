import type { Difficulty, Author } from '../common/value-objects';

/**
 * DTOs for Split domain
 */

export interface CreateSplitDto {
	userId: string;
	title: string;
	description?: string | null;
	isPublic?: boolean;
	isDefault?: boolean;
	difficulty: Difficulty;
	duration?: number | null;
	imageUrl?: string | null;
	videoUrl?: string | null;
	tags?: string[] | null;
	days: CreateSplitDayDto[];
}

export interface CreateSplitDayDto {
	dayNumber: number;
	name: string;
	isRestDay: boolean;
	exercises: CreateDayExerciseDto[];
}

export interface CreateDayExerciseDto {
	exerciseId?: string | null;
	exerciseName: string;
	sets: number;
	reps: string;
	restTime?: number | null;
	order: number;
	notes?: string | null;
}

export interface UpdateSplitDto {
	title?: string;
	description?: string | null;
	isPublic?: boolean;
	difficulty?: Difficulty;
	duration?: number | null;
	imageUrl?: string | null;
	videoUrl?: string | null;
	tags?: string[] | null;
}

export interface SplitFiltersDto {
	userId?: string;
	isPublic?: boolean;
	isDefault?: boolean;
	difficulty?: Difficulty;
	tags?: string[];
	search?: string;
}

export interface SplitWithDetailsDto {
	split: {
		id: string;
		userId: string;
		title: string;
		description: string | null;
		isPublic: boolean;
		isDefault: boolean;
		difficulty: Difficulty;
		duration: number | null;
		imageUrl: string | null;
		videoUrl: string | null;
		tags: string[] | null;
		createdAt: Date;
		updatedAt: Date;
	};
	author: Author;
	days: SplitDayWithExercisesDto[];
	likesCount: number;
	commentsCount: number;
	isLiked: boolean;
}

export interface SplitDayWithExercisesDto {
	id: string;
	splitId: string;
	dayNumber: number;
	name: string;
	isRestDay: boolean;
	exercises: DayExerciseWithDetailsDto[];
	createdAt: Date;
	updatedAt: Date;
}

export interface DayExerciseWithDetailsDto {
	id: string;
	dayId: string;
	exerciseId: string | null;
	sets: number;
	reps: string;
	restTime: number | null;
	order: number;
	notes: string | null;
	exercise: {
		id: string;
		name: string;
		description: string | null;
		difficulty: Difficulty;
		muscleGroup: string;
		equipmentType: string;
		imageUrl: string | null;
		videoUrl: string | null;
	};
	createdAt: Date;
}
