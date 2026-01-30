import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { ForumTopicWithDetails } from '$core/domain/forum/forum.dto';
import { NotFoundError } from '$core/domain/common/errors';

/**
 * Use case for retrieving a forum topic by ID
 * Increments view count on successful retrieval
 */
export class GetTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Gets a topic by ID and increments its view count
	 * @param {string} id - ID of the topic to retrieve
	 * @returns {Promise<ForumTopicWithDetails>} Topic with full details
	 * @throws {NotFoundError} If topic doesn't exist
	 */
	async execute(id: string): Promise<ForumTopicWithDetails> {
		const topic = await this.forumRepository.findTopicById(id);
		if (!topic) {
			throw new NotFoundError('Topic', id);
		}

		// Increment view count
		await this.forumRepository.incrementViewCount(id);

		return topic;
	}
}
