import type { ILikeRepository } from '../../ports/repositories/like.repository.port';

/**
 * Use case for checking whether a user has liked a split
 */
export class HasUserLikedSplitUseCase {
	constructor(private likeRepository: ILikeRepository) {}

	/**
	 * Checks if the user has liked the given split
	 * @param {string} userId - ID of the user
	 * @param {string} splitId - ID of the split
	 * @returns {Promise<boolean>} True if the user has liked the split
	 */
	async execute(userId: string, splitId: string): Promise<boolean> {
		return this.likeRepository.hasUserLiked(userId, splitId);
	}
}
