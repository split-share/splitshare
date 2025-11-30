import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ForumRepository } from '$lib/services/forum/forum.repository';
import { ForumService } from '$lib/services/forum/forum.service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirect=/forum/${params.categorySlug}/new`);
	}

	const repository = new ForumRepository(db);
	const service = new ForumService(repository);

	const category = await service.getCategoryBySlug(params.categorySlug);

	if (!category) {
		throw error(404, 'Category not found');
	}

	return {
		category
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;

		const repository = new ForumRepository(db);
		const service = new ForumService(repository);

		const category = await service.getCategoryBySlug(params.categorySlug);

		if (!category) {
			throw error(404, 'Category not found');
		}

		try {
			const topic = await service.createTopic({
				categoryId: category.id,
				userId: locals.user.id,
				title,
				content
			});

			throw redirect(303, `/forum/topic/${topic.id}`);
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : 'Failed to create topic'
			};
		}
	}
};
