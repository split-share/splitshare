import type { IWeightEntryRepository } from '../../ports/repositories/weight-entry.repository.port';

/**
 * Use case for deleting a weight entry
 * Verifies ownership before allowing deletion
 */
export class DeleteWeightEntryUseCase {
	constructor(private weightEntryRepository: IWeightEntryRepository) {}

	/**
	 * Deletes an existing weight entry
	 * @param {string} id - ID of the weight entry to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {Error} If weight entry not found
	 * @throws {Error} If user doesn't own the entry
	 */
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
