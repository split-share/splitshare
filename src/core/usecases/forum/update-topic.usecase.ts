import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { UpdateTopicDto, ForumTopicWithDetails } from '$core/domain/forum/forum.dto';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

/**
 * Use case for updating a forum topic
 * Verifies ownership before allowing updates
 */
export class UpdateTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Updates an existing forum topic
	 * @param {string} id - ID of the topic to update
	 * @param {string} userId - ID of the user requesting the update
	 * @param {UpdateTopicDto} input - Updated topic data
	 * @returns {Promise<ForumTopicWithDetails>} The updated topic with details
	 * @throws {NotFoundError} If topic doesn't exist
	 * @throws {ForbiddenError} If user doesn't own the topic
	 */
	async execute(id: string, userId: string, input: UpdateTopicDto): Promise<ForumTopicWithDetails> {
		const exists = await this.forumRepository.topicExists(id);
		if (!exists) {
			throw new NotFoundError('Topic', id);
		}

		const isOwner = await this.forumRepository.isTopicOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'topic');
		}

		return this.forumRepository.updateTopic(id, input);
	}
}
