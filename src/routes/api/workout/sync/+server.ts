import { json } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await event.request.json();
		const { sessionId, exerciseElapsedSeconds, restRemainingSeconds, pausedAt } = data;

		if (!sessionId) {
			return json({ error: 'Session ID required' }, { status: 400 });
		}

		const updateData: Record<string, unknown> = {};

		if (exerciseElapsedSeconds !== undefined) {
			updateData.exerciseElapsedSeconds = parseInt(exerciseElapsedSeconds);
		}
		if (restRemainingSeconds !== undefined) {
			updateData.restRemainingSeconds = parseInt(restRemainingSeconds);
		}
		if (pausedAt !== undefined) {
			updateData.pausedAt = pausedAt ? new Date(pausedAt) : null;
		}

		await container.updateWorkoutSession.execute(sessionId, userId, updateData);

		return json({ success: true });
	} catch (error) {
		console.error('Workout sync error:', error);
		return json({ error: 'Sync failed' }, { status: 500 });
	}
};
