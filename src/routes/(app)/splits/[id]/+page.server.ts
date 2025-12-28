import { error, fail } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { logAction } from '$lib/server/logger';
import { mutationLimiter, rateLimit } from '$lib/server/rate-limit';
import type { PageServerLoad, Actions } from './$types';

function getFormString(formData: FormData, key: string): string | null {
	const value = formData.get(key);
	return typeof value === 'string' ? value : null;
}

export const load: PageServerLoad = async (event) => {
	const splitId = event.params.id;
	const currentUserId = event.locals.user?.id;

	const splitData = await container.splitRepository.findByIdWithDetails(splitId, currentUserId);

	if (!splitData) {
		error(404, 'Split not found');
	}

	const [likes, comments, hasUserLiked] = await Promise.all([
		container.likeRepository.findBySplitId(splitId),
		container.commentRepository.findBySplitId(splitId),
		currentUserId
			? container.likeRepository.hasUserLiked(currentUserId, splitId)
			: Promise.resolve(false)
	]);

	// Log split view
	logAction(event, 'split.view', {
		success: true,
		resourceId: splitId,
		resourceType: 'split'
	});

	return {
		split: splitData,
		likes,
		comments,
		hasUserLiked
	};
};

export const actions: Actions = {
	like: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const splitId = event.params.id;

		try {
			await container.likeSplit.execute({
				userId: event.locals.user.id,
				splitId
			});

			logAction(event, 'split.like', {
				success: true,
				resourceId: splitId,
				resourceType: 'split'
			});
		} catch (err) {
			logAction(event, 'split.like', {
				success: false,
				resourceId: splitId,
				resourceType: 'split',
				error: err instanceof Error ? err : String(err)
			});
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to like split' });
		}

		return { success: true };
	},

	unlike: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const splitId = event.params.id;

		try {
			await container.unlikeSplit.execute(event.locals.user.id, splitId);

			logAction(event, 'split.unlike', {
				success: true,
				resourceId: splitId,
				resourceType: 'split'
			});
		} catch (err) {
			logAction(event, 'split.unlike', {
				success: false,
				resourceId: splitId,
				resourceType: 'split',
				error: err instanceof Error ? err : String(err)
			});
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to unlike split' });
		}

		return { success: true };
	},

	addComment: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const content = getFormString(formData, 'content');
		const splitId = event.params.id;

		if (!content || !content.trim()) {
			return fail(400, { error: 'Comment content is required' });
		}

		try {
			await container.addComment.execute({
				userId: event.locals.user.id,
				splitId,
				content
			});

			logAction(event, 'comment.create', {
				success: true,
				resourceId: splitId,
				resourceType: 'split',
				metadata: { contentLength: content.length }
			});
		} catch (err) {
			logAction(event, 'comment.create', {
				success: false,
				resourceId: splitId,
				resourceType: 'split',
				error: err instanceof Error ? err : String(err)
			});
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to add comment' });
		}

		return { success: true };
	},

	updateComment: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const commentId = getFormString(formData, 'commentId');
		const content = getFormString(formData, 'content');

		if (!commentId || !content || !content.trim()) {
			return fail(400, { error: 'Comment ID and content are required' });
		}

		try {
			await container.updateComment.execute(commentId, event.locals.user.id, { content });

			logAction(event, 'comment.update', {
				success: true,
				resourceId: commentId,
				resourceType: 'comment'
			});
		} catch (err) {
			logAction(event, 'comment.update', {
				success: false,
				resourceId: commentId,
				resourceType: 'comment',
				error: err instanceof Error ? err : String(err)
			});
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to update comment' });
		}

		return { success: true };
	},

	deleteComment: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Rate limit mutations
		const rateLimitResult = await rateLimit(event, mutationLimiter);
		if (!rateLimitResult.success) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await event.request.formData();
		const commentId = getFormString(formData, 'commentId');

		if (!commentId) {
			return fail(400, { error: 'Comment ID is required' });
		}

		try {
			await container.deleteComment.execute(commentId, event.locals.user.id);

			logAction(event, 'comment.delete', {
				success: true,
				resourceId: commentId,
				resourceType: 'comment'
			});
		} catch (err) {
			logAction(event, 'comment.delete', {
				success: false,
				resourceId: commentId,
				resourceType: 'comment',
				error: err instanceof Error ? err : String(err)
			});
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to delete comment' });
		}

		return { success: true };
	}
};
