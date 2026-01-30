import { describe, it, expect, vi, type Mocked } from 'vitest';
import { GetWorkoutHistoryUseCase } from '$core/usecases/workout/get-workout-history.usecase';
import type { IWorkoutLogRepository } from '$core/ports/repositories/workout-log.repository.port';
import type { WorkoutLogWithDetailsDto } from '$core/domain/workout/workout.dto';

describe('GetWorkoutHistoryUseCase', () => {
	const createMockRepo = (): Mocked<IWorkoutLogRepository> =>
		({
			findByUserId: vi.fn(),
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserIdAndDateRange: vi.fn(),
			createWithExercises: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn(),
			getUserStats: vi.fn(),
			findExerciseHistory: vi.fn(),
			hasCompletedWorkoutForSplit: vi.fn()
		}) as unknown as Mocked<IWorkoutLogRepository>;

	it('returns workout logs', async () => {
		const repo = createMockRepo();
		const logs: WorkoutLogWithDetailsDto[] = [
			{
				id: 'log1',
				userId: 'u1',
				splitId: 's1',
				dayId: 'd1',
				split: { id: 's1', title: 'Test Split' },
				day: { id: 'd1', name: 'Day 1', dayNumber: 1 },
				duration: 60,
				notes: null,
				completedAt: new Date(),
				exercises: [],
				createdAt: new Date()
			}
		];
		repo.findByUserId.mockResolvedValue(logs);
		const useCase = new GetWorkoutHistoryUseCase(repo);
		const result = await useCase.execute('u1', 10);
		expect(result).toBe(logs);
	});
});
