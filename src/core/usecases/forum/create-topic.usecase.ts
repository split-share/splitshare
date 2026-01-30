import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type { CreateTopicDto, ForumTopicWithDetails } from '$core/domain/forum/forum.dto';
import { NotFoundError } from '$core/domain/common/errors';

/**
 * Use case for creating a new forum topic
 * Validates category exists before creating
 */
export class CreateTopicUseCase {
	constructor(private forumRepository: IForumRepository) {}

	/**
	 * Creates a new forum topic
	 * @param {CreateTopicDto} input - Topic creation data (title, content, categoryId, userId)
	 * @returns {Promise<ForumTopicWithDetails>} The created topic with details
	 * @throws {NotFoundError} If category doesn't exist
	 */
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
