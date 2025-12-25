import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case: Delete a split
 */
export class DeleteSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

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
