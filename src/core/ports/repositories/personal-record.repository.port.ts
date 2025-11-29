import type { PersonalRecord } from '../../domain/workout/personal-record.entity';
import type { PersonalRecordDto } from '../../domain/workout/workout.dto';

export interface IPersonalRecordRepository {
	findById(id: string): Promise<PersonalRecord | undefined>;

	findByUserIdAndExerciseId(
		userId: string,
		exerciseId: string
	): Promise<PersonalRecord | undefined>;

	findByUserId(userId: string): Promise<PersonalRecordDto[]>;

	upsert(
		userId: string,
		exerciseId: string,
		weight: number,
		reps: number,
		achievedAt: Date
	): Promise<PersonalRecord>;

	delete(id: string): Promise<void>;

	isOwnedByUser(id: string, userId: string): Promise<boolean>;
}
