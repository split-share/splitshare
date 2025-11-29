import type { Like } from '$core/domain/split/like.entity';
import type { CreateLikeDto, LikeWithUserDto } from '$core/domain/split/like.dto';

/**
 * Port interface for Like repository
 * Can be implemented by any data access technology (Drizzle, Prisma, etc.)
 */
export interface ILikeRepository {
	/**
	 * Find a like by ID
	 */
	findById(id: string): Promise<Like | undefined>;

	/**
	 * Find a like by user ID and split ID
	 */
	findByUserIdAndSplitId(userId: string, splitId: string): Promise<Like | undefined>;

	/**
	 * Find all likes for a split with user information
	 */
	findBySplitId(splitId: string): Promise<LikeWithUserDto[]>;

	/**
	 * Get the count of likes for a split
	 */
	countBySplitId(splitId: string): Promise<number>;

	/**
	 * Create a new like
	 */
	create(data: CreateLikeDto): Promise<Like>;

	/**
	 * Delete a like by ID
	 */
	delete(id: string): Promise<void>;

	/**
	 * Delete a like by user ID and split ID
	 */
	deleteByUserIdAndSplitId(userId: string, splitId: string): Promise<void>;

	/**
	 * Check if a user has liked a split
	 */
	hasUserLiked(userId: string, splitId: string): Promise<boolean>;
}
