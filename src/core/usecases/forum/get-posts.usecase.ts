import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { ForumPostWithAuthor, PaginationDto } from '$core/domain/forum/forum.dto';

/**
 * Use case for retrieving forum posts for a topic
 * Supports pagination for large threads
 */
export class GetPostsUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Gets posts for a specific topic with pagination
	 * @param {string} topicId - ID of the topic to get posts for
	 * @param {PaginationDto} pagination - Pagination options (page, limit)
	 * @returns {Promise<ForumPostWithAuthor[]>} List of posts with author info
	 */
	async execute(topicId: string, pagination: PaginationDto): Promise<ForumPostWithAuthor[]> {
		return this.forumRepository.findPostsByTopicId(topicId, pagination);
	}
}
