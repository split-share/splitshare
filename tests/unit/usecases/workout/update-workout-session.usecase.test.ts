import { describe, it, expect, vi } from 'vitest';
import { UpdateWorkoutSessionUseCase } from '$core/usecases/workout/update-workout-session.usecase';

const createMockRepo = () => ({
	isOwnedByUser: vi.fn(),
	update: vi.fn()
});

describe('UpdateWorkoutSessionUseCase', () => {
	it('updates session when owned', async () => {
		const repo = createMockRepo();
		const session = {
			id: 'sess1',
			userId: 'u1',
			startAt: new Date(),
			completedAt: null,
			duration: 0,
			exercises: []
		} as any;
		repo.isOwnedByUser.mockResolvedValue(true);
		repo.update.mockResolvedValue(session as any);
		const useCase = new UpdateWorkoutSessionUseCase(repo as any);
		const result = await useCase.execute('sess1', 'u1', { duration: 10 } as any);
		expect(result).toBe(session);
		expect(repo.update).toHaveBeenCalledWith('sess1', { duration: 10 });
	});

	it('throws when not owned', async () => {
		const repo = createMockRepo();
		repo.isOwnedByUser.mockResolvedValue(false);
		const useCase = new UpdateWorkoutSessionUseCase(repo as any);
		await expect(useCase.execute('sess1', 'u1', { duration: 10 } as any)).rejects.toThrow(
			'Session not found or not owned by user'
		);
	});
});
