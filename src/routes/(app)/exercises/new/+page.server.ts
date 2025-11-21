import { db } from '$lib/server/db';
import { exercises } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { rateLimit, uploadLimiter, rateLimitError } from '$lib/server/rate-limit';
import { createExerciseSchema } from '$lib/schemas/exercise';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const rateLimitResult = await rateLimit(event, uploadLimiter);
	if (!rateLimitResult.success) {
		throw rateLimitError(rateLimitResult.reset);
	}

	return {};
};

export const actions: Actions = {
	create: async (event) => {
		// Rate limit check
		const rateLimitResult = await rateLimit(event, uploadLimiter);
		if (!rateLimitResult.success) {
			throw rateLimitError(rateLimitResult.reset);
		}

		// Parse and validate form data
		const formData = await event.request.formData();
		const data = Object.fromEntries(formData);

		// Parse the JSON payload
		let parsedData;
		try {
			parsedData = JSON.parse(data.payload as string);
		} catch {
			return fail(400, { error: 'Invalid form data' });
		}

		// Validate with Zod
		const validation = createExerciseSchema.safeParse(parsedData);
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		const validatedData = validation.data;

		try {
			// Create the exercise
			await db
				.insert(exercises)
				.values({
					userId: event.locals.user!.id,
					name: validatedData.name,
					description: validatedData.description,
					difficulty: validatedData.difficulty,
					muscleGroup: validatedData.muscleGroup,
					equipmentType: validatedData.equipmentType,
					imageUrl: validatedData.imageUrl,
					videoUrl: validatedData.videoUrl
				})
				.returning();

			// Redirect back to split creation page
			throw redirect(303, '/splits/new');
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error instanceof Response) {
				throw error;
			}

			console.error('Error creating exercise:', error);
			return fail(500, { error: 'Failed to create exercise' });
		}
	}
};
