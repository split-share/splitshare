import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type {
	ForumTopicWithDetails,
	TopicFiltersDto,
	PaginationDto
} from '$core/domain/forum/forum.dto';

/**
 * Use case for retrieving forum topics with filters
 * Supports filtering by category and pagination
 */
export class GetTopicsUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Gets forum topics with optional filters and pagination
	 * @param {TopicFiltersDto} filters - Filter criteria (category, search, etc.)
	 * @param {PaginationDto} pagination - Pagination options (page, limit)
	 * @returns {Promise<ForumTopicWithDetails[]>} List of topics with details
	 */
	async execute(
		filters: TopicFiltersDto,
		pagination: PaginationDto
	): Promise<ForumTopicWithDetails[]> {
		return this.forumRepository.findTopicsWithFilters(filters, pagination);
	}
}
