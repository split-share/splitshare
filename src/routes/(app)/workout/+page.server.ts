import { fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { logAction } from '$lib/server/logger';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const url = event.url;

	// Check for active session first
	const activeSession = await container.getActiveWorkoutSession.execute(userId);

	// Get splits for selection
	const splitEntities = await container.splitRepository.findByUserId(userId);
	const splits = await Promise.all(
		splitEntities.map(async (s) => {
			const details = await container.splitRepository.findByIdWithDetails(s.id);
			return {
				id: s.id,
				title: s.title,
				days:
					details?.days
						.filter((d) => !d.isRestDay && d.exercises.length > 0)
						.map((d) => ({
							id: d.id,
							name: d.name,
							dayNumber: d.dayNumber,
							exerciseCount: d.exercises.length
						})) || []
			};
		})
	);

	// Check for URL params (from play button redirect)
	const splitIdParam = url.searchParams.get('splitId');
	const dayIdParam = url.searchParams.get('dayId');

	return {
		activeSession,
		splits,
		preselectedSplitId: splitIdParam,
		preselectedDayId: dayIdParam
	};
};

export const actions: Actions = {
	start: async (event) => {
		const formData = await event.request.formData();
		const splitId = formData.get('splitId') as string;
		const dayId = formData.get('dayId') as string;
		const userId = event.locals.user!.id;

		if (!splitId || !dayId) {
			return fail(400, { error: 'Please select a split and day' });
		}

		try {
			await container.startWorkoutSession.execute({
				userId,
				splitId,
				dayId
			});

			logAction(event, 'workout.start', {
				success: true,
				resourceId: splitId,
				resourceType: 'split',
				metadata: { dayId }
			});
		} catch (error) {
			logAction(event, 'workout.start', {
				success: false,
				resourceId: splitId,
				resourceType: 'split',
				error: error instanceof Error ? error : String(error)
			});
			return fail(400, { error: (error as Error).message });
		}

		return { success: true };
	},

	completeSet: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const weight = formData.get('weight') as string;
		const reps = formData.get('reps') as string;
		const notes = formData.get('notes') as string;
		const userId = event.locals.user!.id;

		if (!sessionId || !reps) {
			return fail(400, { error: 'Missing required fields' });
		}

		try {
			await container.completeSet.execute({
				sessionId,
				userId,
				weight: weight ? parseFloat(weight) : null,
				reps: parseInt(reps),
				notes: notes || null
			});

			logAction(event, 'workout.set_complete', {
				success: true,
				resourceId: sessionId,
				resourceType: 'workout_session',
				metadata: { weight: weight ? parseFloat(weight) : null, reps: parseInt(reps) }
			});
		} catch (error) {
			logAction(event, 'workout.set_complete', {
				success: false,
				resourceId: sessionId,
				resourceType: 'workout_session',
				error: error instanceof Error ? error : String(error)
			});
			return fail(400, { error: (error as Error).message });
		}

		return { success: true };
	},

	skipRest: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const userId = event.locals.user!.id;

		try {
			await container.updateWorkoutSession.execute(sessionId, userId, {
				phase: 'exercise',
				restRemainingSeconds: null,
				exerciseElapsedSeconds: 0
			});
		} catch (error) {
			return fail(400, { error: (error as Error).message });
		}

		return { success: true };
	},

	pause: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const exerciseElapsedSeconds = formData.get('exerciseElapsedSeconds') as string;
		const userId = event.locals.user!.id;

		try {
			await container.updateWorkoutSession.execute(sessionId, userId, {
				pausedAt: new Date(),
				exerciseElapsedSeconds: parseInt(exerciseElapsedSeconds) || 0
			});
		} catch (error) {
			return fail(400, { error: (error as Error).message });
		}

		return { success: true };
	},

	resume: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const userId = event.locals.user!.id;

		try {
			await container.updateWorkoutSession.execute(sessionId, userId, {
				pausedAt: null
			});
		} catch (error) {
			return fail(400, { error: (error as Error).message });
		}

		return { success: true };
	},

	complete: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const notes = formData.get('notes') as string;
		const userId = event.locals.user!.id;

		try {
			await container.completeWorkoutSession.execute({
				sessionId,
				userId,
				notes: notes || null
			});

			logAction(event, 'workout.complete', {
				success: true,
				resourceId: sessionId,
				resourceType: 'workout_session'
			});
		} catch (error) {
			logAction(event, 'workout.complete', {
				success: false,
				resourceId: sessionId,
				resourceType: 'workout_session',
				error: error instanceof Error ? error : String(error)
			});
			return fail(400, { error: (error as Error).message });
		}

		redirect(303, '/dashboard');
	},

	abandon: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const userId = event.locals.user!.id;

		try {
			await container.abandonWorkoutSession.execute(sessionId, userId);

			logAction(event, 'workout.abandon', {
				success: true,
				resourceId: sessionId,
				resourceType: 'workout_session'
			});
		} catch (error) {
			logAction(event, 'workout.abandon', {
				success: false,
				resourceId: sessionId,
				resourceType: 'workout_session',
				error: error instanceof Error ? error : String(error)
			});
			return fail(400, { error: (error as Error).message });
		}

		return { success: true };
	},

	sync: async (event) => {
		const formData = await event.request.formData();
		const sessionId = formData.get('sessionId') as string;
		const exerciseElapsedSeconds = formData.get('exerciseElapsedSeconds') as string;
		const restRemainingSeconds = formData.get('restRemainingSeconds') as string;
		const userId = event.locals.user!.id;

		try {
			const updateData: Record<string, unknown> = {};
			if (exerciseElapsedSeconds) {
				updateData.exerciseElapsedSeconds = parseInt(exerciseElapsedSeconds);
			}
			if (restRemainingSeconds) {
				updateData.restRemainingSeconds = parseInt(restRemainingSeconds);
			}
			await container.updateWorkoutSession.execute(sessionId, userId, updateData);
		} catch {
			// Silently fail for sync - not critical
		}

		return { success: true };
	}
};
