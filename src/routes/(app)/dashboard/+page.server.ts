import { container } from '$infrastructure/di/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const [stats, workoutHistory, personalRecords] = await Promise.all([
		container.getUserStats.execute(userId),
		container.getWorkoutHistory.execute(userId, 10),
		container.getPersonalRecords.execute(userId)
	]);

	return {
		stats,
		workoutHistory,
		personalRecords
	};
};
