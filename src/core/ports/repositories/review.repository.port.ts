import type { Review } from '$core/domain/split/review.entity';
import type {
	CreateReviewDto,
	UpdateReviewDto,
	ReviewWithUserDto,
	ReviewStatsDto
} from '$core/domain/split/review.dto';

/**
 * Port interface for Review repository
 * Can be implemented by any data access technology (Drizzle, Prisma, etc.)
 */
export interface IReviewRepository {
	/**
	 * Find a review by ID
	 */
	findById(id: string): Promise<Review | undefined>;

	/**
	 * Find a review by ID with user information
	 */
	findByIdWithUser(id: string): Promise<ReviewWithUserDto | undefined>;

	/**
	 * Find a user's review for a specific split
	 */
	findByUserAndSplit(userId: string, splitId: string): Promise<Review | undefined>;

	/**
	 * Find all reviews for a split with user information, ordered by creation date
	 */
	findBySplitId(splitId: string): Promise<ReviewWithUserDto[]>;

	/**
	 * Get aggregate statistics for a split's reviews
	 */
	getReviewStats(splitId: string): Promise<ReviewStatsDto>;

	/**
	 * Create a new review
	 */
	create(data: CreateReviewDto): Promise<Review>;

	/**
	 * Update a review
	 */
	update(id: string, data: UpdateReviewDto): Promise<Review>;

	/**
	 * Delete a review
	 */
	delete(id: string): Promise<void>;

	/**
	 * Check if a review is owned by a user
	 */
	isOwnedByUser(id: string, userId: string): Promise<boolean>;

	/**
	 * Check if a user has already reviewed a split
	 */
	hasUserReviewedSplit(userId: string, splitId: string): Promise<boolean>;
}
