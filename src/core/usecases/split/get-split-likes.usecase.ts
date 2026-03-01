import type { ILikeRepository } from '../../ports/repositories/like.repository.port';
import type { LikeWithUserDto } from '../../domain/split/like.dto';

/**
 * Use case for retrieving all likes for a split
 */
export class GetSplitLikesUseCase {
	constructor(private likeRepository: ILikeRepository) {}

	/**
	 * Gets all likes for a split with user information
	 * @param {string} splitId - ID of the split
	 * @returns {Promise<LikeWithUserDto[]>} Likes with user details
	 */
	async execute(splitId: string): Promise<LikeWithUserDto[]> {
		return this.likeRepository.findBySplitId(splitId);
	}
}
