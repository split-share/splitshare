import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import { ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for deleting a comment on a split
 * Verifies ownership before allowing deletion
 */
export class DeleteCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	/**
	 * Deletes an existing comment
	 * @param {string} commentId - ID of the comment to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {ForbiddenError} If user doesn't own the comment
	 */
	async execute(commentId: string, userId: string): Promise<void> {
		const isOwner = await this.commentRepository.isOwnedByUser(commentId, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'comment');
		}

		await this.commentRepository.delete(commentId);
	}
}
