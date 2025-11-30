import { fail, redirect } from '@sveltejs/kit';
import { rateLimit, uploadLimiter, rateLimitError } from '$lib/server/rate-limit';
import { createCompleteSplitSchema } from '$lib/schemas/split';
import { container } from '$infrastructure/di/container';
import type { PageServerLoad, Actions } from './$types';

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
			videoUrl: exercise.videoUrl,
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
		const data = Object.fromEntries(formData);

		let parsedData;
		try {
			parsedData = JSON.parse(data.payload as string);
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

		const split = await container.createSplit.execute({
			userId: event.locals.user!.id,
			title: validatedData.title,
			description: validatedData.description,
			difficulty: validatedData.difficulty,
			duration: validatedData.duration,
			isPublic: validatedData.isPublic,
			tags: validatedData.tags,
			imageUrl: validatedData.imageUrl,
			videoUrl: validatedData.videoUrl,
			days: validatedData.days
		});

		redirect(303, `/splits/${split.id}`);
	}
};
