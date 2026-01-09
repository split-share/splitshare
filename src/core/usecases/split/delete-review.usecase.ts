import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for deleting a review
 */
export class DeleteReviewUseCase {
	constructor(private reviewRepository: IReviewRepository) {}

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
