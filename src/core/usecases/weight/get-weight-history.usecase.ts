import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { WeightEntryWithStatsDto } from '../../domain/weight/weight-entry.dto';

export class GetWeightHistoryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	async execute(userId: string, limit = 100): Promise<WeightEntryWithStatsDto[]> {
		return this.weightEntryRepository.findByUserId(userId, limit);
	}
}
