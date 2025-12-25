import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { CreateWeightEntryDto } from '../../domain/weight/weight-entry.dto';
import type { WeightEntry } from '../../domain/weight/weight-entry.entity';
import { WeightEntry as WeightEntryEntity } from '../../domain/weight/weight-entry.entity';

export class CreateWeightEntryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	async execute(input: CreateWeightEntryDto): Promise<WeightEntry> {
		WeightEntryEntity.validateWeight(input.weight);
		WeightEntryEntity.validateRecordedDate(input.recordedAt);

		const existsForDate = await this.weightEntryRepository.existsForDate(
			input.userId,
			input.recordedAt
		);
		if (existsForDate) {
			throw new Error('You already have a weight entry for this date');
		}

		return this.weightEntryRepository.create(input);
	}
}
