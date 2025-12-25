import type { ILikeRepository } from '$core/ports/repositories/like.repository.port';
import { NotFoundError } from '$core/domain/common/errors';

/**
 * Use case for unliking a split
 */
export class UnlikeSplitUseCase {
	constructor(private likeRepository: ILikeRepository) {}

	async execute(userId: string, splitId: string): Promise<void> {
		const existingLike = await this.likeRepository.findByUserIdAndSplitId(userId, splitId);
		if (!existingLike) {
			throw new NotFoundError('Like', `user:${userId}-split:${splitId}`);
		}

		await this.likeRepository.deleteByUserIdAndSplitId(userId, splitId);
	}
}
