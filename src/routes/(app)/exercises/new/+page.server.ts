import { fail, redirect } from '@sveltejs/kit';
import { rateLimit, uploadLimiter, rateLimitError } from '$lib/server/rate-limit';
import { createExerciseSchema } from '$lib/schemas/exercise';
import { container } from '$infrastructure/di/container';
import type { PageServerLoad, Actions } from './$types';

function getFormString(formData: FormData, key: string): string | null {
	const value = formData.get(key);
	return typeof value === 'string' ? value : null;
}

export const load: PageServerLoad = async (event) => {
	const rateLimitResult = await rateLimit(event, uploadLimiter);
	if (!rateLimitResult.success) {
		throw rateLimitError(rateLimitResult.reset);
	}

	return {};
};

export const actions: Actions = {
	create: async (event) => {
		const rateLimitResult = await rateLimit(event, uploadLimiter);
		if (!rateLimitResult.success) {
			throw rateLimitError(rateLimitResult.reset);
		}

		const formData = await event.request.formData();
		const payload = getFormString(formData, 'payload');

		if (!payload) {
			return fail(400, { error: 'Invalid form data' });
		}

		let parsedData;
		try {
			parsedData = JSON.parse(payload);
		} catch {
			return fail(400, { error: 'Invalid form data' });
		}

		const validation = createExerciseSchema.safeParse(parsedData);
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		const validatedData = validation.data;

		const exercise = await container.createExercise.execute({
			userId: event.locals.user!.id,
			name: validatedData.name,
			description: validatedData.description,
			difficulty: validatedData.difficulty,
			muscleGroup: validatedData.muscleGroup,
			equipmentType: validatedData.equipmentType,
			imageUrl: validatedData.imageUrl,
			gifUrl: validatedData.gifUrl
		});

		// Check if this is an AJAX request (from modal) or regular form submission
		const isAjaxRequest = event.request.headers.get('accept')?.includes('application/json');

		if (isAjaxRequest) {
			// Return the created exercise for AJAX requests (modal)
			return { success: true, exercise };
		}

		// Redirect for regular form submissions
		redirect(303, '/splits/new');
	}
};
