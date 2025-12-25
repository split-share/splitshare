import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { WeightStatsDto } from '../../domain/weight/weight-entry.dto';

export class GetWeightStatsUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	async execute(userId: string): Promise<WeightStatsDto> {
		return this.weightEntryRepository.getUserStats(userId);
	}
}
