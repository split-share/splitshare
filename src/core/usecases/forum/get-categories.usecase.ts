import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { ForumCategoryWithStats } from '$core/domain/forum/forum.dto';

export class GetCategoriesUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(): Promise<ForumCategoryWithStats[]> {
		return this.forumRepository.findCategoriesWithStats();
	}
}
