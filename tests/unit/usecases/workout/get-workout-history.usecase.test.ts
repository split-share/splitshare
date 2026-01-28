import { describe, it, expect, vi } from 'vitest';
import { GetWorkoutHistoryUseCase } from '$core/usecases/workout/get-workout-history.usecase';

const createMockRepo = () => ({
	findByUserId: vi.fn()
});

describe('GetWorkoutHistoryUseCase', () => {
	it('returns workout logs', async () => {
		const repo = createMockRepo();
		const logs = [{ id: 'log1', userId: 'u1' } as any];
		repo.findByUserId.mockResolvedValue(logs);
		const useCase = new GetWorkoutHistoryUseCase(repo as any);
		const result = await useCase.execute('u1', 10);
		expect(result).toBe(logs);
	});
});
