import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { UpdatePostDto, ForumPostWithAuthor } from '$core/domain/forum/forum.dto';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for updating a forum post
 * Verifies ownership before allowing updates
 */
export class UpdatePostUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Updates an existing forum post
	 * @param {string} id - ID of the post to update
	 * @param {string} userId - ID of the user requesting the update
	 * @param {UpdatePostDto} input - Updated post data
	 * @returns {Promise<ForumPostWithAuthor>} The updated post with author info
	 * @throws {NotFoundError} If post doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the post
	 */
	async execute(id: string, userId: string, input: UpdatePostDto): Promise<ForumPostWithAuthor> {
		const exists = await this.forumRepository.postExists(id);
		if (!exists) {
			throw new NotFoundError('Post', id);
		}

		const isOwner = await this.forumRepository.isPostOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'post');
		}

		return this.forumRepository.updatePost(id, input);
	}
}
