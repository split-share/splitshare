import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { ForumPostWithAuthor, PaginationDto } from '$core/domain/forum/forum.dto';

export class GetPostsUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(topicId: string, pagination: PaginationDto): Promise<ForumPostWithAuthor[]> {
		return this.forumRepository.findPostsByTopicId(topicId, pagination);
	}
}
