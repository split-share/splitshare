import { error, fail } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import type { PageServerLoad, Actions } from './$types';

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

		const splitId = event.params.id;

		try {
			await container.likeSplit.execute({
				userId: event.locals.user.id,
				splitId
			});
		} catch (err) {
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to like split' });
		}

		return { success: true };
	},

	unlike: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const splitId = event.params.id;

		try {
			await container.unlikeSplit.execute(event.locals.user.id, splitId);
		} catch (err) {
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to unlike split' });
		}

		return { success: true };
	},

	addComment: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const content = formData.get('content') as string;
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
		} catch (err) {
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to add comment' });
		}

		return { success: true };
	},

	updateComment: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const commentId = formData.get('commentId') as string;
		const content = formData.get('content') as string;

		if (!commentId || !content || !content.trim()) {
			return fail(400, { error: 'Comment ID and content are required' });
		}

		try {
			await container.updateComment.execute(commentId, event.locals.user.id, { content });
		} catch (err) {
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to update comment' });
		}

		return { success: true };
	},

	deleteComment: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const commentId = formData.get('commentId') as string;

		if (!commentId) {
			return fail(400, { error: 'Comment ID is required' });
		}

		try {
			await container.deleteComment.execute(commentId, event.locals.user.id);
		} catch (err) {
			return fail(400, { error: err instanceof Error ? err.message : 'Failed to delete comment' });
		}

		return { success: true };
	}
};
