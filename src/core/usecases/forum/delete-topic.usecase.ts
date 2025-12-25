import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

export class DeleteTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.forumRepository.topicExists(id);
		if (!exists) {
			throw new NotFoundError('Topic', id);
		}

		const isOwner = await this.forumRepository.isTopicOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'topic');
		}

		await this.forumRepository.deleteTopic(id);
	}
}
