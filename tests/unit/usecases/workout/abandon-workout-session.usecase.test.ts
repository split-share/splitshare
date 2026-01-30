import { describe, it, expect, vi, type Mocked } from 'vitest';
import { AbandonWorkoutSessionUseCase } from '$core/usecases/workout/abandon-workout-session.usecase';
import type { IWorkoutSessionRepository } from '$core/ports/repositories/workout-session.repository.port';

describe('AbandonWorkoutSessionUseCase', () => {
	const createMockRepo = (): Mocked<IWorkoutSessionRepository> =>
		({
			isOwnedByUser: vi.fn(),
			delete: vi.fn(),
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findActiveByUserId: vi.fn(),
			findActiveByUserIdWithDetails: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			exists: vi.fn()
		}) as unknown as Mocked<IWorkoutSessionRepository>;

	it('should delete session when owned by user', async () => {
		const repo = createMockRepo();
		repo.isOwnedByUser.mockResolvedValue(true);
		const useCase = new AbandonWorkoutSessionUseCase(repo);
		await expect(useCase.execute('session-1', 'user-1')).resolves.toBeUndefined();
		expect(repo.isOwnedByUser).toHaveBeenCalledWith('session-1', 'user-1');
	});

	it('should throw error when not owned', async () => {
		const repo = createMockRepo();
		repo.isOwnedByUser.mockResolvedValue(false);
		const useCase = new AbandonWorkoutSessionUseCase(repo);
		await expect(useCase.execute('session-1', 'user-1')).rejects.toThrow(
			'Session not found or not owned by user'
		);
	});
});
