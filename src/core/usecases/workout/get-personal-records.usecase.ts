import type { IPersonalRecordRepository } from '../../ports/repositories/personal-record.repository.port';
import type { PersonalRecordDto } from '../../domain/workout/workout.dto';

export class GetPersonalRecordsUseCase {
	constructor(private personalRecordRepository: IPersonalRecordRepository) {}

	async execute(userId: string): Promise<PersonalRecordDto[]> {
		return this.personalRecordRepository.findByUserId(userId);
	}
}
