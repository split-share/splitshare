import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';

/**
 * Use case for deleting a comment
 */
export class DeleteCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	async execute(commentId: string, userId: string): Promise<void> {
		const isOwner = await this.commentRepository.isOwnedByUser(commentId, userId);
		if (!isOwner) {
			throw new Error('Not authorized to delete this comment');
		}

		await this.commentRepository.delete(commentId);
	}
}
