import type { ILikeRepository } from '$core/ports/repositories/like.repository.port';
import type { ISplitRepository } from '$core/ports/repositories/split.repository.port';
import type { Like } from '$core/domain/split/like.entity';
import type { CreateLikeDto } from '$core/domain/split/like.dto';
import { NotFoundError, AlreadyExistsError } from '$core/domain/common/errors';

/**
 * Use case for liking a split
 * Validates split existence and prevents duplicate likes
 */
export class LikeSplitUseCase {
	constructor(
		private likeRepository: ILikeRepository,
		private splitRepository: ISplitRepository
	) {}

	/**
	 * Creates a like for a split
	 * @param {CreateLikeDto} input - Like data (userId, splitId)
	 * @returns {Promise<Like>} The created like entity
	 * @throws {NotFoundError} If split doesn't exist
	 * @throws {AlreadyExistsError} If user has already liked this split
	 */
	async execute(input: CreateLikeDto): Promise<Like> {
		const split = await this.splitRepository.findById(input.splitId);
		if (!split) {
			throw new NotFoundError('Split', input.splitId);
		}

		const existingLike = await this.likeRepository.findByUserIdAndSplitId(
			input.userId,
			input.splitId
		);
		if (existingLike) {
			throw new AlreadyExistsError('Like');
		}

		return this.likeRepository.create(input);
	}
}
