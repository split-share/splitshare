import { fail, redirect } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { logAction, logger } from '$lib/server/logger';
import type { PageServerLoad, Actions } from './$types';

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function getFormString(formData: FormData, key: string): string | null {
	const value = formData.get(key);
	return typeof value === 'string' ? value : null;
}

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

	// Load progression suggestions if there's an active session
	let progressionSuggestions: Record<
		string,
		import('$core/domain/workout/progression-suggestion.dto').ProgressionSuggestionDto
	> = {};
	if (activeSession) {
		const exerciseIds = activeSession.exercises
			.map((e) => e.exerciseId)
			.filter((id): id is string => id !== null);
		const suggestionsMap = await container.getProgressionSuggestions.execute(userId, exerciseIds);
		progressionSuggestions = Object.fromEntries(suggestionsMap);
	}

	return {
		activeSession,
		splits,
		preselectedSplitId: splitIdParam,
		preselectedDayId: dayIdParam,
		progressionSuggestions
	};
};

export const actions: Actions = {
	start: async (event) => {
		const formData = await event.request.formData();
		const splitId = getFormString(formData, 'splitId');
		const dayId = getFormString(formData, 'dayId');
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
			return fail(400, { error: getErrorMessage(error) });
		}

		return { success: true };
	},

	completeSet: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const weight = getFormString(formData, 'weight');
		const reps = getFormString(formData, 'reps');
		const notes = getFormString(formData, 'notes');
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
			return fail(400, { error: getErrorMessage(error) });
		}

		return { success: true };
	},

	skipRest: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const userId = event.locals.user!.id;

		if (!sessionId) {
			return fail(400, { error: 'Session ID is required' });
		}

		try {
			await container.updateWorkoutSession.execute(sessionId, userId, {
				phase: 'exercise',
				restRemainingSeconds: null,
				exerciseElapsedSeconds: 0
			});
		} catch (error) {
			return fail(400, { error: getErrorMessage(error) });
		}

		return { success: true };
	},

	pause: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const exerciseElapsedSeconds = getFormString(formData, 'exerciseElapsedSeconds');
		const userId = event.locals.user!.id;

		if (!sessionId) {
			return fail(400, { error: 'Session ID is required' });
		}

		try {
			await container.updateWorkoutSession.execute(sessionId, userId, {
				pausedAt: new Date(),
				exerciseElapsedSeconds: exerciseElapsedSeconds ? parseInt(exerciseElapsedSeconds) : 0
			});
		} catch (error) {
			return fail(400, { error: getErrorMessage(error) });
		}

		return { success: true };
	},

	resume: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const userId = event.locals.user!.id;

		if (!sessionId) {
			return fail(400, { error: 'Session ID is required' });
		}

		try {
			await container.updateWorkoutSession.execute(sessionId, userId, {
				pausedAt: null
			});
		} catch (error) {
			return fail(400, { error: getErrorMessage(error) });
		}

		return { success: true };
	},

	complete: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const notes = getFormString(formData, 'notes');
		const userId = event.locals.user!.id;

		if (!sessionId) {
			return fail(400, { error: 'Session ID is required' });
		}

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
			return fail(400, { error: getErrorMessage(error) });
		}

		redirect(303, '/dashboard');
	},

	abandon: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const userId = event.locals.user!.id;

		if (!sessionId) {
			return fail(400, { error: 'Session ID is required' });
		}

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
			return fail(400, { error: getErrorMessage(error) });
		}

		return { success: true };
	},

	sync: async (event) => {
		const formData = await event.request.formData();
		const sessionId = getFormString(formData, 'sessionId');
		const exerciseElapsedSeconds = getFormString(formData, 'exerciseElapsedSeconds');
		const restRemainingSeconds = getFormString(formData, 'restRemainingSeconds');
		const userId = event.locals.user!.id;

		if (!sessionId) {
			return { success: false };
		}

		try {
			const updateData: Record<string, unknown> = {};
			if (exerciseElapsedSeconds) {
				updateData.exerciseElapsedSeconds = parseInt(exerciseElapsedSeconds);
			}
			if (restRemainingSeconds) {
				updateData.restRemainingSeconds = parseInt(restRemainingSeconds);
			}
			await container.updateWorkoutSession.execute(sessionId, userId, updateData);
		} catch (error) {
			logger.debug('Workout sync failed', { sessionId, error: getErrorMessage(error) });
			return { success: false };
		}

		return { success: true };
	}
};
