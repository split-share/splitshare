import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { ForumTopicWithDetails } from '$core/domain/forum/forum.dto';
import { NotFoundError } from '$core/domain/common/errors';

export class GetTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

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
