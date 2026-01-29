import { describe, it, expect, vi } from 'vitest';
import { GetUserStatsUseCase } from '$core/usecases/workout/get-user-stats.usecase';

const createMockRepo = () => ({
	getUserStats: vi.fn()
});

describe('GetUserStatsUseCase', () => {
	it('returns stats', async () => {
		const repo = createMockRepo();
		const stats = { totalWorkouts: 5 };
		repo.getUserStats.mockResolvedValue(stats as never);
		const useCase = new GetUserStatsUseCase(repo as never);
		const result = await useCase.execute('u1');
		expect(result).toBe(stats);
	});
});
