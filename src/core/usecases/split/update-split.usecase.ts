import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { UpdateSplitDto } from '../../domain/split/split.dto';
import type { Split } from '../../domain/split/split.entity';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case for updating an existing split
 * Verifies ownership before allowing updates
 */
export class UpdateSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Updates an existing split
	 * @param {string} id - ID of the split to update
	 * @param {string} userId - ID of the user requesting the update
	 * @param {UpdateSplitDto} input - Updated split data
	 * @returns {Promise<Split>} The updated split entity
	 * @throws {NotFoundError} If split doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the split
	 */
	async execute(id: string, userId: string, input: UpdateSplitDto): Promise<Split> {
		const exists = await this.splitRepository.exists(id);
		if (!exists) {
			throw new NotFoundError('Split', id);
		}

		const isOwner = await this.splitRepository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'split');
		}

		return this.splitRepository.update(id, input);
	}
}
