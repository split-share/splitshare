import type { ILikeRepository } from '$core/ports/repositories/like.repository.port';
import type { ISplitRepository } from '$core/ports/repositories/split.repository.port';
import { Like } from '$core/domain/split/like.entity';
import type { CreateLikeDto } from '$core/domain/split/like.dto';

/**
 * Use case for liking a split
 */
export class LikeSplitUseCase {
	constructor(
		private likeRepository: ILikeRepository,
		private splitRepository: ISplitRepository
	) {}

	async execute(input: CreateLikeDto): Promise<Like> {
		Like.validateUserId(input.userId);
		Like.validateSplitId(input.splitId);

		const split = await this.splitRepository.findById(input.splitId);
		if (!split) {
			throw new Error('Split not found');
		}

		const existingLike = await this.likeRepository.findByUserIdAndSplitId(
			input.userId,
			input.splitId
		);
		if (existingLike) {
			throw new Error('Split already liked');
		}

		return this.likeRepository.create(input);
	}
}
