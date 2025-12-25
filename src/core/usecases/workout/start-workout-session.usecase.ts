import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { CreateWorkoutSessionDto } from '../../domain/workout/workout-session.dto';
import type { WorkoutSession } from '../../domain/workout/workout-session.entity';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../../domain/common/errors';

export class StartWorkoutSessionUseCase {
	constructor(
		private workoutSessionRepository: IWorkoutSessionRepository,
		private splitRepository: ISplitRepository
	) {}

	async execute(input: CreateWorkoutSessionDto): Promise<WorkoutSession> {
		// Check for existing active session
		const existingSession = await this.workoutSessionRepository.findActiveByUserId(input.userId);
		if (existingSession) {
			throw new BusinessRuleError(
				'You already have an active workout session. Please complete or abandon it first.'
			);
		}

		// Validate split exists and user has access
		const split = await this.splitRepository.findByIdWithDetails(input.splitId, input.userId);
		if (!split) {
			throw new NotFoundError('Split', input.splitId);
		}

		// Validate user owns split or it's public
		if (split.split.userId !== input.userId && !split.split.isPublic) {
			throw new ForbiddenError('access', 'split');
		}

		// Validate day exists in split
		const day = split.days.find((d) => d.id === input.dayId);
		if (!day) {
			throw new NotFoundError('Day');
		}

		// Validate day is not a rest day
		if (day.isRestDay) {
			throw new BusinessRuleError('Cannot start a workout on a rest day');
		}

		// Validate day has exercises
		if (day.exercises.length === 0) {
			throw new BusinessRuleError('This day has no exercises');
		}

		return this.workoutSessionRepository.create(input);
	}
}
