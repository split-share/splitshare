import type { IWorkoutLogRepository } from '$core/ports/repositories/workout-log.repository.port';
import { BusinessRuleError } from '$core/domain/common/errors';

/**
 * Use case for checking if a user is eligible to review a split
 * User must have completed at least one workout using the split
 */
export class CheckReviewEligibilityUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

	async execute(userId: string, splitId: string): Promise<boolean> {
		return this.workoutLogRepository.hasCompletedWorkoutForSplit(userId, splitId);
	}

	/**
	 * Throws error if user is not eligible
	 */
	async assertEligible(userId: string, splitId: string): Promise<void> {
		const isEligible = await this.execute(userId, splitId);

		if (!isEligible) {
			throw new BusinessRuleError(
				'You must complete at least one workout using this split before you can review it'
			);
		}
	}
}
