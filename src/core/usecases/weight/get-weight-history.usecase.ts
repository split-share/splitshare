import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { WeightEntryWithStatsDto } from '../../domain/weight/weight-entry.dto';

/**
 * Use case for retrieving weight entry history
 */
export class GetWeightHistoryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	/**
	 * Gets weight entry history for a user
	 * @param {string} userId - ID of the user
	 * @param {number} limit - Maximum number of entries to return (default: 100)
	 * @returns {Promise<WeightEntryWithStatsDto[]>} List of weight entries with stats
	 */
	async execute(userId: string, limit = 100): Promise<WeightEntryWithStatsDto[]> {
		return this.weightEntryRepository.findByUserId(userId, limit);
	}
}
