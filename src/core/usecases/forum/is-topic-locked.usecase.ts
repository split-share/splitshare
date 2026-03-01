import type { IForumRepository } from '../../ports/repositories/forum.repository.port';

/**
 * Use case for checking whether a forum topic is locked
 */
export class IsTopicLockedUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Checks if the given topic is locked
	 * @param {string} topicId - ID of the topic
	 * @returns {Promise<boolean>} True if the topic is locked
	 */
	async execute(topicId: string): Promise<boolean> {
		return this.forumRepository.isTopicLocked(topicId);
	}
}
