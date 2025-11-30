import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ForumRepository } from '$lib/services/forum/forum.repository';
import { ForumService } from '$lib/services/forum/forum.service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {

	const repository = new ForumRepository(db);
	const service = new ForumService(repository);

	const topic = await service.getTopicById(params.id);

	if (!topic) {
		throw error(404, 'Topic not found');
	}

	const posts = await service.getPostsByTopic(params.id, { limit: 100, offset: 0 });

	return {
		topic,
		posts,
		user: locals.user
	};
};

export const actions: Actions = {
	createPost: async ({ request, params, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const content = formData.get('content') as string;

		const repository = new ForumRepository(db);
		const service = new ForumService(repository);

		try {
			await service.createPost({
				topicId: params.id,
				userId: locals.user.id,
				content
			});

			return { success: true };
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : 'Failed to create post'
			};
		}
	},

	updatePost: async ({ request, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const postId = formData.get('postId') as string;
		const content = formData.get('content') as string;

		const repository = new ForumRepository(db);
		const service = new ForumService(repository);

		try {
			await service.updatePost(postId, locals.user.id, { content });
			return { success: true };
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : 'Failed to update post'
			};
		}
	},

	deletePost: async ({ request, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const postId = formData.get('postId') as string;

		const repository = new ForumRepository(db);
		const service = new ForumService(repository);

		try {
			await service.deletePost(postId, locals.user.id);
			return { success: true };
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : 'Failed to delete post'
			};
		}
	},

	deleteTopic: async ({ params, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const repository = new ForumRepository(db);
		const service = new ForumService(repository);

		try {
			const topic = await service.getTopicById(params.id);
			if (!topic) {
				throw error(404, 'Topic not found');
			}

			await service.deleteTopic(params.id, locals.user.id);
			throw redirect(303, `/forum/${topic.category.slug}`);
		} catch (err) {
			if (err instanceof Error && 'status' in err) throw err;
			return {
				error: err instanceof Error ? err.message : 'Failed to delete topic'
			};
		}
	}
};
