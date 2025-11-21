import type { ExerciseRepository } from './exercise.repository';
import type { Exercise, CreateExerciseInput, UpdateExerciseInput, ExerciseFilters } from './types';

export class ExerciseService {
	constructor(private repository: ExerciseRepository) {}

	async getExerciseById(id: string): Promise<Exercise | undefined> {
		return this.repository.findById(id);
	}

	async getUserExercises(userId: string): Promise<Exercise[]> {
		return this.repository.findByUserId(userId);
	}

	async searchExercises(filters: ExerciseFilters): Promise<Exercise[]> {
		return this.repository.findWithFilters(filters);
	}

	async createExercise(input: CreateExerciseInput): Promise<Exercise> {
		// Validate input
		if (!input.name.trim()) {
			throw new Error('Exercise name is required');
		}

		if (!input.muscleGroup.trim()) {
			throw new Error('Muscle group is required');
		}

		if (!input.equipmentType.trim()) {
			throw new Error('Equipment type is required');
		}

		if (!['beginner', 'intermediate', 'advanced'].includes(input.difficulty)) {
			throw new Error('Invalid difficulty level');
		}

		return this.repository.create(input);
	}

	async updateExercise(id: string, userId: string, input: UpdateExerciseInput): Promise<Exercise> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('Exercise not found');
		}

		const isOwner = await this.repository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new Error('Not authorized to update this exercise');
		}

		// Validate input if provided
		if (input.name !== undefined && !input.name.trim()) {
			throw new Error('Exercise name cannot be empty');
		}

		if (input.muscleGroup !== undefined && !input.muscleGroup.trim()) {
			throw new Error('Muscle group cannot be empty');
		}

		if (input.equipmentType !== undefined && !input.equipmentType.trim()) {
			throw new Error('Equipment type cannot be empty');
		}

		if (input.difficulty && !['beginner', 'intermediate', 'advanced'].includes(input.difficulty)) {
			throw new Error('Invalid difficulty level');
		}

		return this.repository.update(id, input);
	}

	async deleteExercise(id: string, userId: string): Promise<void> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('Exercise not found');
		}

		const isOwner = await this.repository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new Error('Not authorized to delete this exercise');
		}

		await this.repository.delete(id);
	}

	async exerciseExists(id: string): Promise<boolean> {
		return this.repository.exists(id);
	}
}
