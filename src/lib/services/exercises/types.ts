import type { Exercise } from '$lib/server/db/schema';

export type { Exercise };

export interface CreateExerciseInput {
	userId: string;
	name: string;
	description?: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	muscleGroup: string;
	equipmentType: string;
	imageUrl?: string;
	videoUrl?: string;
}

export interface UpdateExerciseInput {
	name?: string;
	description?: string;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	muscleGroup?: string;
	equipmentType?: string;
	imageUrl?: string;
	videoUrl?: string;
}

export interface ExerciseFilters {
	userId?: string;
	muscleGroup?: string;
	equipmentType?: string;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	search?: string;
}
