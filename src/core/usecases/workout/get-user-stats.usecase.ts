import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { WorkoutStatsDto } from '../../domain/workout/workout.dto';

/**
 * Use case for retrieving workout statistics for a user
 */
export class GetUserStatsUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

	/**
	 * Gets workout statistics for a user (total workouts, time, volume, etc.)
	 * @param {string} userId - ID of the user
	 * @returns {Promise<WorkoutStatsDto>} Workout statistics summary
	 */
	async execute(userId: string): Promise<WorkoutStatsDto> {
		return this.workoutLogRepository.getUserStats(userId);
	}
}
