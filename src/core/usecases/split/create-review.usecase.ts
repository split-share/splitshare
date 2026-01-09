import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import type { ISplitRepository } from '$core/ports/repositories/split.repository.port';
import type { Review } from '$core/domain/split/review.entity';
import type { CreateReviewDto } from '$core/domain/split/review.dto';
import { NotFoundError, AlreadyExistsError } from '$core/domain/common/errors';
import { CheckReviewEligibilityUseCase } from './check-review-eligibility.usecase';

/**
 * Use case for creating a review for a split
 * Validates split exists, checks for duplicate reviews, and verifies user eligibility
 */
export class CreateReviewUseCase {
	constructor(
		private reviewRepository: IReviewRepository,
		private splitRepository: ISplitRepository,
		private checkEligibility: CheckReviewEligibilityUseCase
	) {}

	/**
	 * Creates a new review for a split
	 * @param {CreateReviewDto} input - Review data (userId, splitId, rating, content)
	 * @returns {Promise<Review>} The created review entity
	 * @throws {NotFoundError} If split doesn't exist
	 * @throws {AlreadyExistsError} If user has already reviewed this split
	 * @throws {BusinessRuleError} If user hasn't completed a workout with this split
	 */
	async execute(input: CreateReviewDto): Promise<Review> {
		// Verify split exists
		const split = await this.splitRepository.findById(input.splitId);
		if (!split) {
			throw new NotFoundError('Split', input.splitId);
		}

		// Check if user has already reviewed this split
		const existingReview = await this.reviewRepository.hasUserReviewedSplit(
			input.userId,
			input.splitId
		);
		if (existingReview) {
			throw new AlreadyExistsError('Review');
		}

		// Check eligibility (must have completed at least one workout)
		await this.checkEligibility.assertEligible(input.userId, input.splitId);

		// Create review
		return this.reviewRepository.create(input);
	}
}
