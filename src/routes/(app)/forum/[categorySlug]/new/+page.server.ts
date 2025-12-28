import { error, fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { createTopicSchema } from '$lib/schemas/forum';
import { NotFoundError } from '$core/domain/common/errors';
import type { Actions, PageServerLoad } from './$types';

function getFormString(formData: FormData, key: string): string | null {
	const value = formData.get(key);
	return typeof value === 'string' ? value : null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirect=/forum/${params.categorySlug}/new`);
	}

	const category = await container.forumRepository.findCategoryBySlug(params.categorySlug);

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
		const title = getFormString(formData, 'title');
		const content = getFormString(formData, 'content');

		const validation = createTopicSchema.safeParse({ title, content });
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		try {
			const topic = await container.createTopic.execute({
				categoryId: params.categorySlug,
				userId: locals.user.id,
				title: validation.data.title,
				content: validation.data.content
			});

			throw redirect(303, `/forum/topic/${topic.id}`);
		} catch (err) {
			if (err instanceof NotFoundError) {
				throw error(404, 'Category not found');
			}
			// Re-throw redirects
			if (err instanceof Response || (err && typeof err === 'object' && 'status' in err)) {
				throw err;
			}
			return fail(400, {
				error: err instanceof Error ? err.message : 'Failed to create topic'
			});
		}
	}
};
