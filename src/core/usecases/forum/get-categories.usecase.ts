import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { ForumCategoryWithStats } from '$core/domain/forum/forum.dto';

/**
 * Use case for retrieving forum categories with statistics
 */
export class GetCategoriesUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Gets all forum categories with topic and post counts
	 * @returns {Promise<ForumCategoryWithStats[]>} List of categories with statistics
	 */
	async execute(): Promise<ForumCategoryWithStats[]> {
		return this.forumRepository.findCategoriesWithStats();
	}
}
