import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { WeightChartDataDto } from '../../domain/weight/weight-entry.dto';

export class GetWeightChartDataUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	async execute(userId: string, limit = 90): Promise<WeightChartDataDto[]> {
		return this.weightEntryRepository.getChartData(userId, limit);
	}
}
