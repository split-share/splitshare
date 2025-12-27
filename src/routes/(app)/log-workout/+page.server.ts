import { fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { logWorkoutSchema } from '$lib/schemas/split';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const splitEntities = await container.splitRepository.findByUserId(userId);

	const splits = await Promise.all(
		splitEntities.map(async (s) => {
			const details = await container.splitRepository.findByIdWithDetails(s.id);
			return {
				id: s.id,
				title: s.title,
				days: details?.days.map((d) => ({ id: d.id, name: d.name, dayNumber: d.dayNumber })) || []
			};
		})
	);

	return {
		splits
	};
};

export const actions: Actions = {
	log: async (event) => {
		const formData = await event.request.formData();
		const data = Object.fromEntries(formData);

		let parsedData: unknown;
		try {
			parsedData = JSON.parse(data.payload as string);
		} catch {
			return fail(400, { error: 'Invalid form data' });
		}

		// Validate with Zod schema
		const validation = logWorkoutSchema.safeParse(parsedData);
		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		const { splitId, dayId, duration, notes, exercises } = validation.data;

		await container.logWorkout.execute({
			userId: event.locals.user!.id,
			splitId,
			dayId,
			duration: duration ?? null,
			notes: notes ?? null,
			completedAt: new Date(),
			exercises: exercises.map((e) => ({
				exerciseId: e.exerciseId,
				sets: e.sets,
				reps: e.reps,
				weight: e.weight ?? null,
				notes: e.notes ?? null
			}))
		});

		redirect(303, '/dashboard');
	}
};
