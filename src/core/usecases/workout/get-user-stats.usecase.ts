import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { WorkoutStatsDto } from '../../domain/workout/workout.dto';

export class GetUserStatsUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

	async execute(userId: string): Promise<WorkoutStatsDto> {
		return this.workoutLogRepository.getUserStats(userId);
	}
}
