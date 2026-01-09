import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import type { ReviewWithUserDto, ReviewStatsDto } from '$core/domain/split/review.dto';

/**
 * Use case for getting reviews for a split
 */
export class GetReviewsUseCase {
	constructor(private reviewRepository: IReviewRepository) {}

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
