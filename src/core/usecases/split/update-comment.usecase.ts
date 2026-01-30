import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import type { Comment } from '$core/domain/split/comment.entity';
import type { UpdateCommentDto } from '$core/domain/split/comment.dto';
import { ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for updating a comment on a split
 * Verifies ownership before allowing updates
 */
export class UpdateCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	/**
	 * Updates an existing comment
	 * @param {string} commentId - ID of the comment to update
	 * @param {string} userId - ID of the user requesting the update
	 * @param {UpdateCommentDto} data - Updated comment data
	 * @returns {Promise<Comment>} The updated comment
	 * @throws {ForbiddenError} If user doesn't own the comment
	 */
	async execute(commentId: string, userId: string, data: UpdateCommentDto): Promise<Comment> {
		const isOwner = await this.commentRepository.isOwnedByUser(commentId, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'comment');
		}

		return this.commentRepository.update(commentId, data);
	}
}
