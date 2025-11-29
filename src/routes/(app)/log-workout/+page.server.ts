import { fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
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

		let parsedData;
		try {
			parsedData = JSON.parse(data.payload as string);
		} catch {
			return fail(400, { error: 'Invalid form data' });
		}

		const { splitId, dayId, duration, notes, exercises } = parsedData;

		if (!splitId || !dayId) {
			return fail(400, { error: 'Split and day are required' });
		}

		if (!exercises || exercises.length === 0) {
			return fail(400, { error: 'At least one exercise is required' });
		}

		await container.logWorkout.execute({
			userId: event.locals.user!.id,
			splitId,
			dayId,
			duration: duration ? parseInt(duration) : null,
			notes: notes || null,
			completedAt: new Date(),
			exercises: exercises.map(
				(e: {
					exerciseId: string;
					sets: string;
					reps: string;
					weight?: string;
					notes?: string;
				}) => ({
					exerciseId: e.exerciseId,
					sets: parseInt(e.sets),
					reps: e.reps,
					weight: e.weight ? parseInt(e.weight) : null,
					notes: e.notes || null
				})
			)
		});

		redirect(303, '/dashboard');
	}
};
