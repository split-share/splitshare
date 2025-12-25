import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type {
	ForumTopicWithDetails,
	TopicFiltersDto,
	PaginationDto
} from '$core/domain/forum/forum.dto';

export class GetTopicsUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(
		filters: TopicFiltersDto,
		pagination: PaginationDto
	): Promise<ForumTopicWithDetails[]> {
		return this.forumRepository.findTopicsWithFilters(filters, pagination);
	}
}
