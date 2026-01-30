import type { ILikeRepository } from '$core/ports/repositories/like.repository.port';
import { NotFoundError } from '$core/domain/common/errors';

/**
 * Use case for unliking a split
 * Removes a user's like from a split
 */
export class UnlikeSplitUseCase {
	constructor(private likeRepository: ILikeRepository) {}

	/**
	 * Removes a like from a split
	 * @param {string} userId - ID of the user unliking the split
	 * @param {string} splitId - ID of the split to unlike
	 * @returns {Promise<void>}
	 * @throws {NotFoundError} If like doesn't exist
	 */
	async execute(userId: string, splitId: string): Promise<void> {
		const existingLike = await this.likeRepository.findByUserIdAndSplitId(userId, splitId);
		if (!existingLike) {
			throw new NotFoundError('Like', `user:${userId}-split:${splitId}`);
		}

		await this.likeRepository.deleteByUserIdAndSplitId(userId, splitId);
	}
}
