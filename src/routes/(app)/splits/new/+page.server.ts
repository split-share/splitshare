import { db } from '$lib/server/db';
import { exercises, splits, splitDays, dayExercises } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { rateLimit, uploadLimiter, rateLimitError } from '$lib/server/rate-limit';
import { createCompleteSplitSchema } from '$lib/schemas/split';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const rateLimitResult = await rateLimit(event, uploadLimiter);
	if (!rateLimitResult.success) {
		throw rateLimitError(rateLimitResult.reset);
	}

	// Load all exercises (user's own and public ones for now)
	// In a real app, you might want to filter or paginate this
	const availableExercises = await db
		.select()
		.from(exercises)
		.where(eq(exercises.userId, event.locals.user!.id))
		.orderBy(exercises.name);

	return {
		exercises: availableExercises
	};
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
		const validation = createCompleteSplitSchema.safeParse(parsedData);
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		const validatedData = validation.data;

		try {
			// Use a transaction to ensure all data is created atomically
			const result = await db.transaction(async (tx) => {
				// 1. Create the split
				const [split] = await tx
					.insert(splits)
					.values({
						userId: event.locals.user!.id,
						title: validatedData.title,
						description: validatedData.description,
						difficulty: validatedData.difficulty,
						duration: validatedData.duration,
						isPublic: validatedData.isPublic,
						tags: validatedData.tags,
						imageUrl: validatedData.imageUrl
					})
					.returning();

				// 2. Create the days for this split
				for (const day of validatedData.days) {
					const [createdDay] = await tx
						.insert(splitDays)
						.values({
							splitId: split.id,
							dayNumber: day.dayNumber,
							name: day.name,
							isRestDay: day.isRestDay
						})
						.returning();

					// 3. If not a rest day, add exercises to the day
					if (!day.isRestDay && day.exercises.length > 0) {
						await tx.insert(dayExercises).values(
							day.exercises.map((exercise) => ({
								dayId: createdDay.id,
								exerciseId: exercise.exerciseId,
								sets: exercise.sets,
								reps: exercise.reps,
								restTime: exercise.restTime,
								order: exercise.order,
								notes: exercise.notes
							}))
						);
					}
				}

				return split;
			});

			// Redirect to the created split's page
			throw redirect(303, `/splits/${result.id}`);
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error instanceof Response) {
				throw error;
			}

			console.error('Error creating split:', error);
			return fail(500, { error: 'Failed to create split' });
		}
	}
};
