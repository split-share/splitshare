import { error, fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { createPostSchema, updatePostSchema } from '$lib/schemas/forum';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '$core/domain/common/errors';
import { sanitizeHtml } from '$lib/utils/sanitize';
import { mutationLimiter, rateLimit } from '$lib/server/rate-limit';
import type { Actions, PageServerLoad } from './$types';

function getFormString(formData: FormData, key: string): string | null {
	const value = formData.get(key);
	return typeof value === 'string' ? value : null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const topic = await container.getTopic.execute(params.id);
		const posts = await container.getPosts.execute(params.id, { limit: 100, offset: 0 });

		// Sanitize HTML content to prevent XSS attacks
		const sanitizedTopic = {
			...topic,
			content: sanitizeHtml(topic.content)
		};

		const sanitizedPosts = posts.map((post) => ({
			...post,
			content: sanitizeHtml(post.content)
		}));

		return {
			topic: sanitizedTopic,
			posts: sanitizedPosts,
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
	createPost: async (event) => {
		if (!event.locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const content = getFormString(formData, 'content');

		const validation = createPostSchema.safeParse({ content });
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		try {
			await container.createPost.execute({
				topicId: event.params.id,
				userId: event.locals.user.id,
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

	updatePost: async (event) => {
		if (!event.locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const postId = getFormString(formData, 'postId');
		const content = getFormString(formData, 'content');

		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		const validation = updatePostSchema.safeParse({ content });
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		try {
			await container.updatePost.execute(postId, event.locals.user.id, {
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

	deletePost: async (event) => {
		if (!event.locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const postId = getFormString(formData, 'postId');

		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			await container.deletePost.execute(postId, event.locals.user.id);
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

	deleteTopic: async (event) => {
		if (!event.locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		try {
			const topic = await container.getTopic.execute(event.params.id);
			await container.deleteTopic.execute(event.params.id, event.locals.user.id);
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
