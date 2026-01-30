import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for deleting a forum post
 * Verifies ownership before allowing deletion
 */
export class DeletePostUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Deletes an existing forum post
	 * @param {string} id - ID of the post to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {NotFoundError} If post doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the post
	 */
	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.forumRepository.postExists(id);
		if (!exists) {
			throw new NotFoundError('Post', id);
		}

		const isOwner = await this.forumRepository.isPostOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'post');
		}

		await this.forumRepository.deletePost(id);
	}
}
