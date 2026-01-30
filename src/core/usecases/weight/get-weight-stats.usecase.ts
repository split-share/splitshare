import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { WeightStatsDto } from '../../domain/weight/weight-entry.dto';

/**
 * Use case for retrieving weight statistics
 */
export class GetWeightStatsUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	/**
	 * Gets weight statistics for a user (current, starting, change, etc.)
	 * @param {string} userId - ID of the user
	 * @returns {Promise<WeightStatsDto>} Weight statistics summary
	 */
	async execute(userId: string): Promise<WeightStatsDto> {
		return this.weightEntryRepository.getUserStats(userId);
	}
}
