import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for deleting a forum topic
 * Verifies ownership before allowing deletion
 */
export class DeleteTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Deletes an existing forum topic
	 * @param {string} id - ID of the topic to delete
	 * @param {string} userId - ID of the user requesting the deletion
	 * @returns {Promise<void>}
	 * @throws {NotFoundError} If topic doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the topic
	 */
	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.forumRepository.topicExists(id);
		if (!exists) {
			throw new NotFoundError('Topic', id);
		}

		const isOwner = await this.forumRepository.isTopicOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'topic');
		}

		await this.forumRepository.deleteTopic(id);
	}
}
