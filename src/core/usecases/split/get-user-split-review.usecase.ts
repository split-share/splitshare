import type { IReviewRepository } from '../../ports/repositories/review.repository.port';
import type { Review } from '../../domain/split/review.entity';

/**
 * Use case for retrieving a user's review for a specific split
 */
export class GetUserSplitReviewUseCase {
	constructor(private reviewRepository: IReviewRepository) {}

	/**
	 * Gets the user's review for a split, if it exists
	 * @param {string} userId - ID of the user
	 * @param {string} splitId - ID of the split
	 * @returns {Promise<Review | undefined>} The review, or undefined if not found
	 */
	async execute(userId: string, splitId: string): Promise<Review | undefined> {
		return this.reviewRepository.findByUserAndSplit(userId, splitId);
	}
}
