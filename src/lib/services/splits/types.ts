import type { Split, SplitDay, DayExercise } from '$lib/server/db/schema';

export type { Split, SplitDay, DayExercise };

export interface CreateSplitInput {
	userId: string;
	title: string;
	description?: string;
	isPublic?: boolean;
	isDefault?: boolean;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	duration?: number;
	imageUrl?: string;
	tags?: string[];
	days: CreateSplitDayInput[];
}

export interface CreateSplitDayInput {
	dayNumber: number;
	name: string;
	isRestDay: boolean;
	exercises: CreateDayExerciseInput[];
}

export interface CreateDayExerciseInput {
	exerciseId: string;
	sets: number;
	reps: string;
	restTime?: number;
	order: number;
	notes?: string;
}

export interface UpdateSplitInput {
	title?: string;
	description?: string;
	isPublic?: boolean;
	isDefault?: boolean;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	duration?: number;
	imageUrl?: string;
	tags?: string[];
}

export interface SplitWithDetails {
	split: Split;
	author: {
		id: string;
		name: string;
		image: string | null;
	};
	days: SplitDayWithExercises[];
	likesCount: number;
	commentsCount: number;
	isLiked: boolean;
}

export interface SplitDayWithExercises extends SplitDay {
	exercises: DayExerciseWithDetails[];
}

export interface DayExerciseWithDetails extends DayExercise {
	exercise: {
		id: string;
		name: string;
		description: string | null;
		difficulty: string;
		muscleGroup: string;
		equipmentType: string;
		imageUrl: string | null;
		videoUrl: string | null;
	};
}

export interface SplitFilters {
	userId?: string;
	isPublic?: boolean;
	isDefault?: boolean;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	tags?: string[];
	search?: string;
}

export interface PaginationOptions {
	limit: number;
	offset: number;
}
