import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';

/**
 * Use case for abandoning an active workout session
 * Verifies ownership before allowing deletion
 */
export class AbandonWorkoutSessionUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

	/**
	 * Abandons and deletes an active workout session
	 * @param {string} sessionId - ID of the session to abandon
	 * @param {string} userId - ID of the user abandoning the session
	 * @returns {Promise<void>}
	 * @throws {Error} If session not found or not owned by user
	 */
	async execute(sessionId: string, userId: string): Promise<void> {
		// Verify ownership
		const isOwned = await this.workoutSessionRepository.isOwnedByUser(sessionId, userId);
		if (!isOwned) {
			throw new Error('Session not found or not owned by user');
		}

		await this.workoutSessionRepository.delete(sessionId);
	}
}
