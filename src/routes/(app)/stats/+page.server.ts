import { fail } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { createWeightEntrySchema } from '$lib/schemas/weight';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const [
		weightStats,
		weightHistory,
		weightChartData,
		workoutStats,
		personalRecords,
		recentWorkouts
	] = await Promise.all([
		container.getWeightStats.execute(userId),
		container.getWeightHistory.execute(userId, 50),
		container.getWeightChartData.execute(userId, 90),
		container.getUserStats.execute(userId),
		container.getPersonalRecords.execute(userId),
		container.getWorkoutHistory.execute(userId, 5)
	]);

	return {
		// Weight tracking data
		weightStats,
		weightHistory,
		weightChartData,
		// Workout stats
		workoutStats,
		personalRecords,
		recentWorkouts
	};
};

export const actions: Actions = {
	add: async (event) => {
		const formData = await event.request.formData();
		const weight = parseFloat(formData.get('weight') as string);
		const notes = formData.get('notes') as string;

		const recordedAt = new Date();
		recordedAt.setHours(0, 0, 0, 0);

		const validation = createWeightEntrySchema.safeParse({
			weight,
			recordedAt,
			notes: notes || undefined
		});

		if (!validation.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: validation.error.flatten().fieldErrors
			});
		}

		try {
			await container.createWeightEntry.execute({
				userId: event.locals.user!.id,
				weight: validation.data.weight,
				recordedAt: validation.data.recordedAt,
				notes: validation.data.notes
			});

			return { success: true };
		} catch (err) {
			return fail(500, {
				error: err instanceof Error ? err.message : 'Failed to add weight entry'
			});
		}
	},

	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Weight entry ID is required' });
		}

		try {
			await container.deleteWeightEntry.execute(id, event.locals.user!.id);
			return { success: true };
		} catch (err) {
			return fail(500, {
				error: err instanceof Error ? err.message : 'Failed to delete weight entry'
			});
		}
	}
};
