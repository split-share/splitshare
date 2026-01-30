import type { IPersonalRecordRepository } from '../../ports/repositories/personal-record.repository.port';
import type { PersonalRecordDto } from '../../domain/workout/workout.dto';

/**
 * Use case for retrieving personal records
 */
export class GetPersonalRecordsUseCase {
	constructor(private personalRecordRepository: IPersonalRecordRepository) {}

	/**
	 * Gets all personal records for a user
	 * @param {string} userId - ID of the user
	 * @returns {Promise<PersonalRecordDto[]>} List of personal records with exercise info
	 */
	async execute(userId: string): Promise<PersonalRecordDto[]> {
		return this.personalRecordRepository.findByUserId(userId);
	}
}
