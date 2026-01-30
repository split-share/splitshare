import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import type { ISplitRepository } from '$core/ports/repositories/split.repository.port';
import type { Comment } from '$core/domain/split/comment.entity';
import type { CreateCommentDto } from '$core/domain/split/comment.dto';
import { NotFoundError } from '$core/domain/common/errors';

/**
 * Use case for adding a comment to a split
 * Validates split existence before creating the comment
 */
export class AddCommentUseCase {
	constructor(
		private commentRepository: ICommentRepository,
		private splitRepository: ISplitRepository
	) {}

	/**
	 * Creates a new comment on a split
	 * @param {CreateCommentDto} input - Comment data (userId, splitId, content)
	 * @returns {Promise<Comment>} The created comment
	 * @throws {NotFoundError} If split doesn't exist
	 */
	async execute(input: CreateCommentDto): Promise<Comment> {
		const split = await this.splitRepository.findById(input.splitId);
		if (!split) {
			throw new NotFoundError('Split', input.splitId);
		}

		return this.commentRepository.create(input);
	}
}
