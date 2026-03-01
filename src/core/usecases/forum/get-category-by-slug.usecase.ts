import type { IForumRepository } from '../../ports/repositories/forum.repository.port';
import type { ForumCategory } from '../../domain/forum/forum.dto';

/**
 * Use case for retrieving a forum category by its slug
 */
export class GetCategoryBySlugUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Gets a forum category by slug
	 * @param {string} slug - URL-friendly slug of the category
	 * @returns {Promise<ForumCategory | undefined>} The category, or undefined if not found
	 */
	async execute(slug: string): Promise<ForumCategory | undefined> {
		return this.forumRepository.findCategoryBySlug(slug);
	}
}
