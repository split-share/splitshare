import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { WorkoutLogWithDetailsDto } from '../../domain/workout/workout.dto';

export class GetWorkoutHistoryUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

	async execute(userId: string, limit?: number): Promise<WorkoutLogWithDetailsDto[]> {
		return this.workoutLogRepository.findByUserId(userId, limit);
	}
}
