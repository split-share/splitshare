import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { WorkoutSessionWithDetailsDto } from '../../domain/workout/workout-session.dto';

export class GetActiveWorkoutSessionUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

	async execute(userId: string): Promise<WorkoutSessionWithDetailsDto | undefined> {
		return this.workoutSessionRepository.findActiveByUserIdWithDetails(userId);
	}
}
