import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { CreateWorkoutSessionDto } from '../../domain/workout/workout-session.dto';
import type { WorkoutSession } from '../../domain/workout/workout-session.entity';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../../domain/common/errors';

/**
 * Use case for starting a new workout session
 * Validates split access, checks for existing sessions, and creates session state
 */
export class StartWorkoutSessionUseCase {
	constructor(
		private workoutSessionRepository: IWorkoutSessionRepository,
		private splitRepository: ISplitRepository
	) {}

	/**
	 * Starts a new workout session for a user
	 * @param {CreateWorkoutSessionDto} input - Session creation data (userId, splitId, dayId)
	 * @returns {Promise<WorkoutSession>} The created workout session
	 * @throws {BusinessRuleError} If user already has an active session
	 * @throws {NotFoundError} If split doesn't exist
	 * @throws {ForbiddenError} If user doesn't have access to the split
	 * @throws {NotFoundError} If day doesn't exist in split
	 * @throws {BusinessRuleError} If day is a rest day or has no exercises
	 */
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
