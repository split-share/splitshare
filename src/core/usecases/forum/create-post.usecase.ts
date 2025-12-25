import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { CreatePostDto, ForumPostWithAuthor } from '$core/domain/forum/forum.dto';
import { NotFoundError, BusinessRuleError } from '$core/domain/common/errors';

export class CreatePostUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(input: CreatePostDto): Promise<ForumPostWithAuthor> {
		const topicExists = await this.forumRepository.topicExists(input.topicId);
		if (!topicExists) {
			throw new NotFoundError('Topic', input.topicId);
		}

		const isLocked = await this.forumRepository.isTopicLocked(input.topicId);
		if (isLocked) {
			throw new BusinessRuleError('This topic is locked and cannot accept new posts');
		}

		return this.forumRepository.createPost(input);
	}
}
