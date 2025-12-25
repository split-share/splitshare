import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { UpdateTopicDto, ForumTopicWithDetails } from '$core/domain/forum/forum.dto';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

export class UpdateTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(id: string, userId: string, input: UpdateTopicDto): Promise<ForumTopicWithDetails> {
		const exists = await this.forumRepository.topicExists(id);
		if (!exists) {
			throw new NotFoundError('Topic', id);
		}

		const isOwner = await this.forumRepository.isTopicOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'topic');
		}

		return this.forumRepository.updateTopic(id, input);
	}
}
