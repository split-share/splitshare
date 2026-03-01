import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { SplitDto } from '../../domain/split/split.dto';

/**
 * Use case for retrieving all splits belonging to a user
 */
export class GetUserSplitsUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Gets all splits for a given user
	 * @param {string} userId - ID of the user
	 * @returns {Promise<SplitDto[]>} List of user's splits
	 */
	async execute(userId: string): Promise<SplitDto[]> {
		return this.splitRepository.findByUserId(userId);
	}
}
