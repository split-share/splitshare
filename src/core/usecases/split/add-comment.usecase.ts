import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import type { ISplitRepository } from '$core/ports/repositories/split.repository.port';
import type { Comment } from '$core/domain/split/comment.entity';
import type { CreateCommentDto } from '$core/domain/split/comment.dto';
import { NotFoundError } from '$core/domain/common/errors';

/**
 * Use case for adding a comment to a split
 */
export class AddCommentUseCase {
	constructor(
		private commentRepository: ICommentRepository,
		private splitRepository: ISplitRepository
	) {}

	async execute(input: CreateCommentDto): Promise<Comment> {
		const split = await this.splitRepository.findById(input.splitId);
		if (!split) {
			throw new NotFoundError('Split', input.splitId);
		}

		return this.commentRepository.create(input);
	}
}
