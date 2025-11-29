import type { ILikeRepository } from '$core/ports/repositories/like.repository.port';
import { Like } from '$core/domain/split/like.entity';

/**
 * Use case for unliking a split
 */
export class UnlikeSplitUseCase {
	constructor(private likeRepository: ILikeRepository) {}

	async execute(userId: string, splitId: string): Promise<void> {
		Like.validateUserId(userId);
		Like.validateSplitId(splitId);

		const existingLike = await this.likeRepository.findByUserIdAndSplitId(userId, splitId);
		if (!existingLike) {
			throw new Error('Like not found');
		}

		await this.likeRepository.deleteByUserIdAndSplitId(userId, splitId);
	}
}
