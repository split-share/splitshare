import { fail, redirect } from '@sveltejs/kit';
import { rateLimit, uploadLimiter, rateLimitError } from '$lib/server/rate-limit';
import { createCompleteSplitSchema } from '$lib/schemas/split';
import { container } from '$infrastructure/di/container';
import { logAction } from '$lib/server/logger';
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

	const availableExercises = await container.exerciseRepository.findByUserId(event.locals.user!.id);

	return {
		exercises: availableExercises.map((exercise) => ({
			id: exercise.id,
			userId: exercise.userId,
			name: exercise.name,
			description: exercise.description,
			muscleGroup: exercise.muscleGroup,
			equipmentType: exercise.equipmentType,
			difficulty: exercise.difficulty,
			imageUrl: exercise.imageUrl,
			gifUrl: exercise.gifUrl,
			createdAt: exercise.createdAt,
			updatedAt: exercise.updatedAt
		}))
	};
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

		const validation = createCompleteSplitSchema.safeParse(parsedData);
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		const validatedData = validation.data;

		try {
			const split = await container.createSplit.execute({
				userId: event.locals.user!.id,
				title: validatedData.title,
				description: validatedData.description,
				difficulty: validatedData.difficulty,
				duration: validatedData.duration,
				isPublic: validatedData.isPublic,
				tags: validatedData.tags,
				imageUrl: validatedData.imageUrl,
				days: validatedData.days
			});

			logAction(event, 'split.create', {
				success: true,
				resourceId: split.id,
				resourceType: 'split',
				metadata: {
					title: validatedData.title,
					isPublic: validatedData.isPublic,
					dayCount: validatedData.days?.length ?? 0
				}
			});

			redirect(303, `/splits/${split.id}`);
		} catch (error) {
			logAction(event, 'split.create', {
				success: false,
				resourceType: 'split',
				error: error instanceof Error ? error : String(error)
			});
			throw error;
		}
	}
};
