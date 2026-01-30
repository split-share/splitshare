import { describe, it, expect, vi, type Mocked } from 'vitest';
import { GetUserStatsUseCase } from '$core/usecases/workout/get-user-stats.usecase';
import type { IWorkoutLogRepository } from '$core/ports/repositories/workout-log.repository.port';
import type { WorkoutStatsDto } from '$core/domain/workout/workout.dto';

describe('GetUserStatsUseCase', () => {
	const createMockRepo = (): Mocked<IWorkoutLogRepository> =>
		({
			getUserStats: vi.fn(),
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndDateRange: vi.fn(),
			createWithExercises: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn(),
			findExerciseHistory: vi.fn(),
			hasCompletedWorkoutForSplit: vi.fn()
		}) as unknown as Mocked<IWorkoutLogRepository>;

	it('returns stats', async () => {
		const repo = createMockRepo();
		const stats: WorkoutStatsDto = {
			totalWorkouts: 5,
			currentStreak: 3,
			totalDuration: 300,
			averageDuration: 60,
			lastWorkoutDate: new Date()
		};
		repo.getUserStats.mockResolvedValue(stats);
		const useCase = new GetUserStatsUseCase(repo);
		const result = await useCase.execute('u1');
		expect(result).toBe(stats);
	});
});
