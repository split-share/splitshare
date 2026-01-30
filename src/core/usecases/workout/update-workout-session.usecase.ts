import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { UpdateWorkoutSessionDto } from '../../domain/workout/workout-session.dto';
import type { WorkoutSession } from '../../domain/workout/workout-session.entity';

/**
 * Use case for updating a workout session
 * Verifies ownership before allowing updates
 */
export class UpdateWorkoutSessionUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

	/**
	 * Updates an existing workout session
	 * @param {string} sessionId - ID of the session to update
	 * @param {string} userId - ID of the user requesting the update
	 * @param {UpdateWorkoutSessionDto} data - Updated session data
	 * @returns {Promise<WorkoutSession>} The updated session
	 * @throws {Error} If session not found or not owned by user
	 */
	async execute(
		sessionId: string,
		userId: string,
		data: UpdateWorkoutSessionDto
	): Promise<WorkoutSession> {
		// Verify ownership
		const isOwned = await this.workoutSessionRepository.isOwnedByUser(sessionId, userId);
		if (!isOwned) {
			throw new Error('Session not found or not owned by user');
		}

		return this.workoutSessionRepository.update(sessionId, data);
	}
}
