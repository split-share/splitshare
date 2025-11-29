import type { Comment } from '$core/domain/split/comment.entity';
import type {
	CreateCommentDto,
	UpdateCommentDto,
	CommentWithUserDto
} from '$core/domain/split/comment.dto';

/**
 * Port interface for Comment repository
 * Can be implemented by any data access technology (Drizzle, Prisma, etc.)
 */
export interface ICommentRepository {
	/**
	 * Find a comment by ID
	 */
	findById(id: string): Promise<Comment | undefined>;

	/**
	 * Find a comment by ID with user information
	 */
	findByIdWithUser(id: string): Promise<CommentWithUserDto | undefined>;

	/**
	 * Find all comments for a split with user information, ordered by creation date
	 */
	findBySplitId(splitId: string): Promise<CommentWithUserDto[]>;

	/**
	 * Get the count of comments for a split
	 */
	countBySplitId(splitId: string): Promise<number>;

	/**
	 * Create a new comment
	 */
	create(data: CreateCommentDto): Promise<Comment>;

	/**
	 * Update a comment
	 */
	update(id: string, data: UpdateCommentDto): Promise<Comment>;

	/**
	 * Delete a comment
	 */
	delete(id: string): Promise<void>;

	/**
	 * Check if a comment is owned by a user
	 */
	isOwnedByUser(id: string, userId: string): Promise<boolean>;
}
