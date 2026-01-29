import { describe, it, expect, vi } from 'vitest';
import { AbandonWorkoutSessionUseCase } from '$core/usecases/workout/abandon-workout-session.usecase';

// Mock repository
const createMockRepo = () => ({
	isOwnedByUser: vi.fn(),
	delete: vi.fn()
});

describe('AbandonWorkoutSessionUseCase', () => {
	it('should delete session when owned by user', async () => {
		const repo = createMockRepo();
		repo.isOwnedByUser.mockResolvedValue(true);
		const useCase = new AbandonWorkoutSessionUseCase(
			repo as unknown as import('$core/ports/repositories/workout-session.repository.port').IWorkoutSessionRepository
		);
		await expect(useCase.execute('session-1', 'user-1')).resolves.toBeUndefined();
		expect(repo.isOwnedByUser).toHaveBeenCalledWith('session-1', 'user-1');
	});

	it('should throw error when not owned', async () => {
		const repo = createMockRepo();
		repo.isOwnedByUser.mockResolvedValue(false);
		const useCase = new AbandonWorkoutSessionUseCase(
			repo as unknown as import('$core/ports/repositories/workout-session.repository.port').IWorkoutSessionRepository
		);
		await expect(useCase.execute('session-1', 'user-1')).rejects.toThrow(
			'Session not found or not owned by user'
		);
	});
});
