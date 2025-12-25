import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import { NotFoundError, ForbiddenError } from '$core/domain/common/errors';

export class DeletePostUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(id: string, userId: string): Promise<void> {
		const exists = await this.forumRepository.postExists(id);
		if (!exists) {
			throw new NotFoundError('Post', id);
		}

		const isOwner = await this.forumRepository.isPostOwnedByUser(id, userId);
		if (!isOwner) {
			throw new ForbiddenError('delete', 'post');
		}

		await this.forumRepository.deletePost(id);
	}
}
