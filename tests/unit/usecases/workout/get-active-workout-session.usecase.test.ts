import { describe, it, expect, vi } from 'vitest';
import { GetActiveWorkoutSessionUseCase } from '$core/usecases/workout/get-active-workout-session.usecase';

const createMockRepo = () => ({
	findActiveByUserIdWithDetails: vi.fn()
});

describe('GetActiveWorkoutSessionUseCase', () => {
	it('returns session details', async () => {
		const repo = createMockRepo();
		const data = { session: { id: 'sess1', userId: 'u1' }, exercises: [] };
		repo.findActiveByUserIdWithDetails.mockResolvedValue(data as never);
		const useCase = new GetActiveWorkoutSessionUseCase(repo as never);
		const result = await useCase.execute('u1');
		expect(result).toBe(data);
	});
});
