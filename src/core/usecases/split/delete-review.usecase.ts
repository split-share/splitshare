import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for deleting a review
 * Verifies ownership before allowing deletion
 */
export class DeleteReviewUseCase {
	constructor(private reviewRepository: IReviewRepository) {}

	/**
	 * Deletes an existing review
	 * @param {string} reviewId - ID of the review to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {NotFoundError} If review doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the review
	 */
	async execute(reviewId: string, userId: string): Promise<void> {
		const review = await this.reviewRepository.findById(reviewId);
		if (!review) {
			throw new NotFoundError('Review', reviewId);
		}

		// Verify ownership
		if (review.userId !== userId) {
			throw new ForbiddenError('delete', 'review');
		}

		await this.reviewRepository.delete(reviewId);
	}
}
