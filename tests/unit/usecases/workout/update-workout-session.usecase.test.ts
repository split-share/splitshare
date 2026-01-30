import { describe, it, expect, vi, type Mocked } from 'vitest';
import { UpdateWorkoutSessionUseCase } from '$core/usecases/workout/update-workout-session.usecase';
import type { IWorkoutSessionRepository } from '$core/ports/repositories/workout-session.repository.port';
import { WorkoutSession } from '$core/domain/workout/workout-session.entity';
import type { UpdateWorkoutSessionDto } from '$core/domain/workout/workout-session.dto';

describe('UpdateWorkoutSessionUseCase', () => {
	const createMockRepo = (): Mocked<IWorkoutSessionRepository> =>
		({
			isOwnedByUser: vi.fn(),
			update: vi.fn(),
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findActiveByUserId: vi.fn(),
			findActiveByUserIdWithDetails: vi.fn(),
			create: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn()
		}) as unknown as Mocked<IWorkoutSessionRepository>;

	it('updates session when owned', async () => {
		const repo = createMockRepo();
		const session = new WorkoutSession(
			'sess1',
			'u1',
			's1',
			'd1',
			0,
			0,
			'exercise',
			0,
			null,
			new Date(),
			null,
			new Date(),
			[],
			new Date()
		);
		repo.isOwnedByUser.mockResolvedValue(true);
		repo.update.mockResolvedValue(session);
		const useCase = new UpdateWorkoutSessionUseCase(repo);
		const data: UpdateWorkoutSessionDto = { currentExerciseIndex: 1 };
		const result = await useCase.execute('sess1', 'u1', data);
		expect(result).toBe(session);
		expect(repo.update).toHaveBeenCalledWith('sess1', { currentExerciseIndex: 1 });
	});

	it('throws when not owned', async () => {
		const repo = createMockRepo();
		repo.isOwnedByUser.mockResolvedValue(false);
		const useCase = new UpdateWorkoutSessionUseCase(repo);
		const data: UpdateWorkoutSessionDto = { currentExerciseIndex: 1 };
		await expect(useCase.execute('sess1', 'u1', data)).rejects.toThrow(
			'Session not found or not owned by user'
		);
	});
});
