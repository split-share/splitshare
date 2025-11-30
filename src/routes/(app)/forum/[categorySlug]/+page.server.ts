import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ForumRepository } from '$lib/services/forum/forum.repository';
import { ForumService } from '$lib/services/forum/forum.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const repository = new ForumRepository(db);
	const service = new ForumService(repository);

	const category = await service.getCategoryBySlug(params.categorySlug);

	if (!category) {
		throw error(404, 'Category not found');
	}

	const topics = await service.getTopics({ categoryId: category.id }, { limit: 50, offset: 0 });

	return {
		category,
		topics
	};
};
