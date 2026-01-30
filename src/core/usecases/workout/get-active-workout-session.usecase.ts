import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { WorkoutSessionWithDetailsDto } from '../../domain/workout/workout-session.dto';

/**
 * Use case for retrieving the active workout session for a user
 */
export class GetActiveWorkoutSessionUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

	/**
	 * Gets the currently active workout session for a user
	 * @param {string} userId - ID of the user
	 * @returns {Promise<WorkoutSessionWithDetailsDto | undefined>} Active session with details, or undefined if none
	 */
	async execute(userId: string): Promise<WorkoutSessionWithDetailsDto | undefined> {
		return this.workoutSessionRepository.findActiveByUserIdWithDetails(userId);
	}
}
