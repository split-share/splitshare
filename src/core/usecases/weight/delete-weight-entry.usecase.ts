import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';

export class DeleteWeightEntryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.weightEntryRepository.exists(id);
		if (!exists) {
			throw new Error('Weight entry not found');
		}

		const isOwned = await this.weightEntryRepository.isOwnedByUser(id, userId);
		if (!isOwned) {
			throw new Error('Unauthorized: You do not own this weight entry');
		}

		await this.weightEntryRepository.delete(id);
	}
}
