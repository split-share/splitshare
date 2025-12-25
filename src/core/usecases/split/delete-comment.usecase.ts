import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import { ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for deleting a comment
 */
export class DeleteCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	async execute(commentId: string, userId: string): Promise<void> {
		const isOwner = await this.commentRepository.isOwnedByUser(commentId, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'comment');
		}

		await this.commentRepository.delete(commentId);
	}
}
