import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { UpdateSplitDto } from '../../domain/split/split.dto';
import type { Split } from '../../domain/split/split.entity';
import { NotFoundError, ForbiddenError } from '../../domain/common/errors';

/**
 * Use case: Update an existing split
 */
export class UpdateSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

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
