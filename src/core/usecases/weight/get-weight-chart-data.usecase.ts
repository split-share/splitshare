import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { WeightChartDataDto } from '../../domain/weight/weight-entry.dto';

/**
 * Use case for retrieving weight chart data
 */
export class GetWeightChartDataUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	/**
	 * Gets weight data formatted for charting
	 * @param {string} userId - ID of the user
	 * @param {number} limit - Maximum number of data points (default: 90)
	 * @returns {Promise<WeightChartDataDto[]>} Weight data formatted for charts
	 */
	async execute(userId: string, limit = 90): Promise<WeightChartDataDto[]> {
		return this.weightEntryRepository.getChartData(userId, limit);
	}
}
