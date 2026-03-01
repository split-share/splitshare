import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { SplitWithDaysDto } from '../../domain/split/split.dto';

/**
 * Use case for retrieving user splits with their days and exercise counts
 * Uses a batch query to avoid N+1 problems
 */
export class GetUserSplitsWithDaysUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Gets all splits for a user with days and exercise counts
	 * @param {string} userId - ID of the user
	 * @returns {Promise<SplitWithDaysDto[]>} Splits with day details
	 */
	async execute(userId: string): Promise<SplitWithDaysDto[]> {
		return this.splitRepository.findByUserIdWithDays(userId);
	}
}
