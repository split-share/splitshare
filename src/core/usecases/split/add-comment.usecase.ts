import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import type { ISplitRepository } from '$core/ports/repositories/split.repository.port';
import { Comment } from '$core/domain/split/comment.entity';
import type { CreateCommentDto } from '$core/domain/split/comment.dto';

/**
 * Use case for adding a comment to a split
 */
export class AddCommentUseCase {
	constructor(
		private commentRepository: ICommentRepository,
		private splitRepository: ISplitRepository
	) {}

	async execute(input: CreateCommentDto): Promise<Comment> {
		Comment.validateUserId(input.userId);
		Comment.validateSplitId(input.splitId);
		Comment.validateContent(input.content);

		const split = await this.splitRepository.findById(input.splitId);
		if (!split) {
			throw new Error('Split not found');
		}

		return this.commentRepository.create(input);
	}
}
