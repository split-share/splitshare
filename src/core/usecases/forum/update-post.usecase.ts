import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { UpdatePostDto, ForumPostWithAuthor } from '$core/domain/forum/forum.dto';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

export class UpdatePostUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(id: string, userId: string, input: UpdatePostDto): Promise<ForumPostWithAuthor> {
		const exists = await this.forumRepository.postExists(id);
		if (!exists) {
			throw new NotFoundError('Post', id);
		}

		const isOwner = await this.forumRepository.isPostOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('update', 'post');
		}

		return this.forumRepository.updatePost(id, input);
	}
}
