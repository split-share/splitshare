import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { UpdateWorkoutSessionDto } from '../../domain/workout/workout-session.dto';
import type { WorkoutSession } from '../../domain/workout/workout-session.entity';

export class UpdateWorkoutSessionUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

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
