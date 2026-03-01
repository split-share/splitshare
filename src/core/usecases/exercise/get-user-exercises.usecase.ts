import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import type { Exercise } from '../../domain/exercise/exercise.entity';

/**
 * Use case for retrieving all exercises belonging to a user
 */
export class GetUserExercisesUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

	/**
	 * Gets all exercises for a given user
	 * @param {string} userId - ID of the user
	 * @returns {Promise<Exercise[]>} List of user's exercises
	 */
	async execute(userId: string): Promise<Exercise[]> {
		return this.exerciseRepository.findByUserId(userId);
	}
}
