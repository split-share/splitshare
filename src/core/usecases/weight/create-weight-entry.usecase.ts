import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';
import type { CreateWeightEntryDto } from '../../domain/weight/weight-entry.dto';
import type { WeightEntry } from '../../domain/weight/weight-entry.entity';

/**
 * Use case for creating or updating a weight entry
 * Uses upsert logic: updates existing entry for the date if present, creates new otherwise
 */
export class CreateWeightEntryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	/**
	 * Creates or updates a weight entry for a user
	 * @param {CreateWeightEntryDto} input - Weight entry data (userId, weight, date, notes)
	 * @returns {Promise<WeightEntry>} The created or updated weight entry
	 */
	async execute(input: CreateWeightEntryDto): Promise<WeightEntry> {
		// Upsert: update if exists for date, create if not
		return this.weightEntryRepository.upsertByDate(input);
	}
}
