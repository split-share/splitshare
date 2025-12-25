import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';

export class AbandonWorkoutSessionUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

	async execute(sessionId: string, userId: string): Promise<void> {
		// Verify ownership
		const isOwned = await this.workoutSessionRepository.isOwnedByUser(sessionId, userId);
		if (!isOwned) {
			throw new Error('Session not found or not owned by user');
		}

		await this.workoutSessionRepository.delete(sessionId);
	}
}
