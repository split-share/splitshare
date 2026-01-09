import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import type { ReviewWithUserDto, ReviewStatsDto } from '$core/domain/split/review.dto';

/**
 * Use case for getting reviews and statistics for a split
 * Fetches reviews and stats in parallel for optimal performance
 */
export class GetReviewsUseCase {
	constructor(private reviewRepository: IReviewRepository) {}

	/**
	 * Gets all reviews and aggregate statistics for a split
	 * @param {string} splitId - ID of the split to get reviews for
	 * @returns {Promise<{reviews: ReviewWithUserDto[], stats: ReviewStatsDto}>} Reviews with user info and aggregate stats
	 */
	async execute(splitId: string): Promise<{
		reviews: ReviewWithUserDto[];
		stats: ReviewStatsDto;
	}> {
		const [reviews, stats] = await Promise.all([
			this.reviewRepository.findBySplitId(splitId),
			this.reviewRepository.getReviewStats(splitId)
		]);

		return { reviews, stats };
	}
}
