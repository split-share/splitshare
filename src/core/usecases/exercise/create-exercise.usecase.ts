import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import type { CreateExerciseDto } from '../../domain/exercise/exercise.dto';
import type { Exercise } from '../../domain/exercise/exercise.entity';

/**
 * Use case for creating a new exercise
 * Allows users to define custom exercises for their workouts
 */
export class CreateExerciseUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

	/**
	 * Creates a new exercise
	 * @param {CreateExerciseDto} input - Exercise data (name, muscleGroup, equipment, etc.)
	 * @returns {Promise<Exercise>} The created exercise
	 */
	async execute(input: CreateExerciseDto): Promise<Exercise> {
		return this.exerciseRepository.create(input);
	}
}
