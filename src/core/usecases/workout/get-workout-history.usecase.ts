import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { WorkoutLogWithDetailsDto } from '../../domain/workout/workout.dto';

/**
 * Use case for retrieving workout history
 */
export class GetWorkoutHistoryUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

	/**
	 * Gets workout history for a user
	 * @param {string} userId - ID of the user
	 * @param {number} [limit] - Optional limit on number of entries
	 * @returns {Promise<WorkoutLogWithDetailsDto[]>} List of workouts with details
	 */
	async execute(userId: string, limit?: number): Promise<WorkoutLogWithDetailsDto[]> {
		return this.workoutLogRepository.findByUserId(userId, limit);
	}
}
