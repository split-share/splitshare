import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case for deleting an exercise
 * Verifies ownership before allowing deletion
 */
export class DeleteExerciseUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

	/**
	 * Deletes an existing exercise
	 * @param {string} id - ID of the exercise to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {NotFoundError} If exercise doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the exercise
	 */
	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.exerciseRepository.exists(id);
		if (!exists) {
			throw new NotFoundError('Exercise', id);
		}

		const isOwner = await this.exerciseRepository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'exercise');
		}

		await this.exerciseRepository.delete(id);
	}
}
