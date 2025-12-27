import { json } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import { workoutSyncSchema } from '$lib/schemas/split';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let sessionId: string | undefined;

	try {
		const rawData = await event.request.json();

		// Validate input with Zod schema
		const validation = workoutSyncSchema.safeParse(rawData);
		if (!validation.success) {
			return json(
				{
					error: 'Validation failed',
					details: validation.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const {
			sessionId: validatedSessionId,
			exerciseElapsedSeconds,
			restRemainingSeconds,
			pausedAt
		} = validation.data;
		sessionId = validatedSessionId;

		const updateData: Record<string, unknown> = {};

		if (exerciseElapsedSeconds !== undefined) {
			updateData.exerciseElapsedSeconds = exerciseElapsedSeconds;
		}
		if (restRemainingSeconds !== undefined) {
			updateData.restRemainingSeconds = restRemainingSeconds;
		}
		if (pausedAt !== undefined) {
			updateData.pausedAt = pausedAt ? new Date(pausedAt) : null;
		}

		await container.updateWorkoutSession.execute(sessionId, userId, updateData);

		return json({ success: true });
	} catch (error) {
		event.locals.logger.error('Workout sync failed', {
			workoutSessionId: sessionId,
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined
		});
		return json({ error: 'Sync failed' }, { status: 500 });
	}
};
