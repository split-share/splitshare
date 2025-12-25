import { error, fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { createPostSchema, updatePostSchema } from '$lib/schemas/forum';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '$core/domain/common/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const topic = await container.getTopic.execute(params.id);
		const posts = await container.getPosts.execute(params.id, { limit: 100, offset: 0 });

		return {
			topic,
			posts,
			user: locals.user
		};
	} catch (err) {
		if (err instanceof NotFoundError) {
			throw error(404, 'Topic not found');
		}
		throw err;
	}
};

export const actions: Actions = {
	createPost: async ({ request, params, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const content = formData.get('content') as string;

		const validation = createPostSchema.safeParse({ content });
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		try {
			await container.createPost.execute({
				topicId: params.id,
				userId: locals.user.id,
				content: validation.data.content
			});

			return { success: true };
		} catch (err) {
			if (err instanceof NotFoundError) {
				return fail(404, { error: 'Topic not found' });
			}
			if (err instanceof BusinessRuleError) {
				return fail(400, { error: err.message });
			}
			return fail(400, {
				error: err instanceof Error ? err.message : 'Failed to create post'
			});
		}
	},

	updatePost: async ({ request, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const postId = formData.get('postId') as string;
		const content = formData.get('content') as string;

		const validation = updatePostSchema.safeParse({ content });
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		try {
			await container.updatePost.execute(postId, locals.user.id, {
				content: validation.data.content
			});
			return { success: true };
		} catch (err) {
			if (err instanceof NotFoundError) {
				return fail(404, { error: 'Post not found' });
			}
			if (err instanceof ForbiddenError) {
				return fail(403, { error: err.message });
			}
			return fail(400, {
				error: err instanceof Error ? err.message : 'Failed to update post'
			});
		}
	},

	deletePost: async ({ request, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const postId = formData.get('postId') as string;

		try {
			await container.deletePost.execute(postId, locals.user.id);
			return { success: true };
		} catch (err) {
			if (err instanceof NotFoundError) {
				return fail(404, { error: 'Post not found' });
			}
			if (err instanceof ForbiddenError) {
				return fail(403, { error: err.message });
			}
			return fail(400, {
				error: err instanceof Error ? err.message : 'Failed to delete post'
			});
		}
	},

	deleteTopic: async ({ params, locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		try {
			const topic = await container.getTopic.execute(params.id);
			await container.deleteTopic.execute(params.id, locals.user.id);
			throw redirect(303, `/forum/${topic.category.slug}`);
		} catch (err) {
			if (err instanceof NotFoundError) {
				throw error(404, 'Topic not found');
			}
			if (err instanceof ForbiddenError) {
				return fail(403, { error: err.message });
			}
			// Re-throw redirects
			if (err instanceof Response || (err && typeof err === 'object' && 'status' in err)) {
				throw err;
			}
			return fail(400, {
				error: err instanceof Error ? err.message : 'Failed to delete topic'
			});
		}
	}
};
