import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import type { UpdateExerciseDto } from '../../domain/exercise/exercise.dto';
import type { Exercise } from '../../domain/exercise/exercise.entity';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case for updating an existing exercise
 * Verifies ownership before allowing updates
 */
export class UpdateExerciseUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

	/**
	 * Updates an existing exercise
	 * @param {string} id - ID of the exercise to update
	 * @param {string} userId - ID of the user requesting the update
	 * @param {UpdateExerciseDto} input - Updated exercise data
	 * @returns {Promise<Exercise>} The updated exercise
	 * @throws {NotFoundError} If exercise doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the exercise
	 */
	async execute(id: string, userId: string, input: UpdateExerciseDto): Promise<Exercise> {
		const exists = await this.exerciseRepository.exists(id);
		if (!exists) {
			throw new NotFoundError('Exercise', id);
		}

		const isOwner = await this.exerciseRepository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'exercise');
		}

		return this.exerciseRepository.update(id, input);
	}
}
