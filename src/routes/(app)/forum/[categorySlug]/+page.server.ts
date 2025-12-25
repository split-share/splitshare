import { error } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const category = await container.forumRepository.findCategoryBySlug(params.categorySlug);

	if (!category) {
		throw error(404, 'Category not found');
	}

	const topics = await container.getTopics.execute(
		{ categoryId: category.id },
		{ limit: 50, offset: 0 }
	);

	return {
		category,
		topics
	};
};
