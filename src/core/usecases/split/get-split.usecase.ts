import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { SplitWithDetailsDto } from '../../domain/split/split.dto';

/**
 * Use case for retrieving a split by ID with details
 */
export class GetSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Gets a split by ID with full details including days and exercises
	 * @param {string} id - ID of the split to retrieve
	 * @param {string} [currentUserId] - Optional ID of current user for access checks
	 * @returns {Promise<SplitWithDetailsDto | undefined>} Split with details, or undefined if not found
	 */
	async execute(id: string, currentUserId?: string): Promise<SplitWithDetailsDto | undefined> {
		return this.splitRepository.findByIdWithDetails(id, currentUserId);
	}
}
