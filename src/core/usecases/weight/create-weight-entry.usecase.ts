import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { CreateWeightEntryDto } from '../../domain/weight/weight-entry.dto';
import type { WeightEntry } from '../../domain/weight/weight-entry.entity';

export class CreateWeightEntryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	async execute(input: CreateWeightEntryDto): Promise<WeightEntry> {
		// Upsert: update if exists for date, create if not
		return this.weightEntryRepository.upsertByDate(input);
	}
}
