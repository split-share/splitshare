import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case: Delete an exercise
 */
export class DeleteExerciseUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

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
