import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { CreateTopicDto, ForumTopicWithDetails } from '$core/domain/forum/forum.dto';
import { NotFoundError } from '$core/domain/common/errors';

export class CreateTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	async execute(input: CreateTopicDto): Promise<ForumTopicWithDetails> {
		// Validate category exists (categoryId is actually a slug in the input)
		const category = await this.forumRepository.findCategoryBySlug(input.categoryId);
		if (!category) {
			throw new NotFoundError('Category');
		}

		// Create topic with the actual category ID
		return this.forumRepository.createTopic({
			...input,
			categoryId: category.id
		});
	}
}
