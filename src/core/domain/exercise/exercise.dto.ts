import type { Difficulty } from '../common/value-objects';

/**
 * DTOs for Exercise domain
 */

export interface CreateExerciseDto {
	userId: string;
	name: string;
	description?: string | null;
	difficulty: Difficulty;
	muscleGroup: string;
	equipmentType: string;
	imageUrl?: string | null;
	gifUrl?: string | null;
}

export interface UpdateExerciseDto {
	name?: string;
	description?: string | null;
	difficulty?: Difficulty;
	muscleGroup?: string;
	equipmentType?: string;
	imageUrl?: string | null;
	gifUrl?: string | null;
}

export interface ExerciseFiltersDto {
	userId?: string;
	muscleGroup?: string;
	equipmentType?: string;
	difficulty?: Difficulty;
	search?: string;
}
