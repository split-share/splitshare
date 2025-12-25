import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import type { Comment } from '$core/domain/split/comment.entity';
import type { UpdateCommentDto } from '$core/domain/split/comment.dto';
import { ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for updating a comment
 */
export class UpdateCommentUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	async execute(commentId: string, userId: string, data: UpdateCommentDto): Promise<Comment> {
		const isOwner = await this.commentRepository.isOwnedByUser(commentId, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'comment');
		}

		return this.commentRepository.update(commentId, data);
	}
}
