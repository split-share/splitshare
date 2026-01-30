import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case for deleting a split
 * Verifies ownership before allowing deletion
 */
export class DeleteSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Deletes an existing split
	 * @param {string} id - ID of the split to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {NotFoundError} If split doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the split
	 */
	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.splitRepository.exists(id);
		if (!exists) {
			throw new NotFoundError('Split', id);
		}

		const isOwner = await this.splitRepository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'split');
		}

		await this.splitRepository.delete(id);
	}
}
