import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { CreatePostDto, ForumPostWithAuthor } from '$core/domain/forum/forum.dto';
import { NotFoundError, BusinessRuleError } from '$core/domain/common/errors';

/**
 * Use case for creating a new forum post
 * Validates topic exists and is not locked
 */
export class CreatePostUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Creates a new post in a forum topic
	 * @param {CreatePostDto} input - Post creation data (content, topicId, userId)
	 * @returns {Promise<ForumPostWithAuthor>} The created post with author info
	 * @throws {NotFoundError} If topic doesn't exist
	 * @throws {BusinessRuleError} If topic is locked
	 */
	async execute(input: CreatePostDto): Promise<ForumPostWithAuthor> {
		const topicExists = await this.forumRepository.topicExists(input.topicId);
		if (!topicExists) {
			throw new NotFoundError('Topic', input.topicId);
		}

		const isLocked = await this.forumRepository.isTopicLocked(input.topicId);
		if (isLocked) {
			throw new BusinessRuleError('This topic is locked and cannot accept new posts');
		}

		return this.forumRepository.createPost(input);
	}
}
