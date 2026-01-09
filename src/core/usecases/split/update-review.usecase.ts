import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import type { Review } from '$core/domain/split/review.entity';
import type { UpdateReviewDto } from '$core/domain/split/review.dto';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for updating a review
 */
export class UpdateReviewUseCase {
	constructor(private reviewRepository: IReviewRepository) {}

	async execute(reviewId: string, userId: string, data: UpdateReviewDto): Promise<Review> {
		const review = await this.reviewRepository.findById(reviewId);
		if (!review) {
			throw new NotFoundError('Review', reviewId);
		}

		// Verify ownership
		if (review.userId !== userId) {
			throw new ForbiddenError('update', 'review');
		}

		return this.reviewRepository.update(reviewId, data);
	}
}
