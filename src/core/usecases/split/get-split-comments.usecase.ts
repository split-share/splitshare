import type { ICommentRepository } from '../../ports/repositories/comment.repository.port';
import type { CommentWithUserDto } from '../../domain/split/comment.dto';

/**
 * Use case for retrieving all comments for a split
 */
export class GetSplitCommentsUseCase {
	constructor(private commentRepository: ICommentRepository) {}

	/**
	 * Gets all comments for a split with user information
	 * @param {string} splitId - ID of the split
	 * @returns {Promise<CommentWithUserDto[]>} Comments with user details
	 */
	async execute(splitId: string): Promise<CommentWithUserDto[]> {
		return this.commentRepository.findBySplitId(splitId);
	}
}
