import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import { Comment } from '$core/domain/split/comment.entity';
import type { UpdateCommentDto } from '$core/domain/split/comment.dto';

/**
 * Use case for updating a comment
 */
export class UpdateCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	async execute(commentId: string, userId: string, data: UpdateCommentDto): Promise<Comment> {
		Comment.validateContent(data.content);

		const isOwner = await this.commentRepository.isOwnedByUser(commentId, userId);
		if (!isOwner) {
			throw new Error('Not authorized to update this comment');
		}

		return this.commentRepository.update(commentId, data);
	}
}
