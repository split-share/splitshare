import { describe, it, expect, vi } from 'vitest';
import { CompleteWorkoutSessionUseCase } from '$core/usecases/workout/complete-workout-session.usecase';
import type { CompleteWorkoutInput } from '$core/usecases/workout/complete-workout-session.usecase';

const createMockRepo = () => ({
	findActiveByUserIdWithDetails: vi.fn(),
	delete: vi.fn()
});

const createMockLogRepo = () => ({
	createWithExercises: vi.fn()
});

const createMockPRRepo = () => ({
	findByUserIdAndExerciseId: vi.fn(),
	upsert: vi.fn()
});

describe('CompleteWorkoutSessionUseCase', () => {
	it('creates log and updates personal records', async () => {
		const sessionRepo = createMockRepo();
		const logRepo = createMockLogRepo();
		const prRepo = createMockPRRepo();
		const mockSession = {
			session: {
				id: 'sess1',
				splitId: 's1',
				dayId: 'd1',
				startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
				completedSets: [
					{ exerciseIndex: 0, weight: 100, reps: 10, notes: null },
					{ exerciseIndex: 0, weight: 110, reps: 8, notes: null }
				],
				userId: 'u1'
			},
			exercises: [{ exerciseId: 'e1', splitId: 's1', dayId: 'd1', name: 'Bench Press' }]
		};
		sessionRepo.findActiveByUserIdWithDetails.mockResolvedValue(mockSession as never);

		// No existing PRs
		prRepo.findByUserIdAndExerciseId.mockResolvedValue(undefined);

		const log = { id: 'log1', userId: 'u1' };
		logRepo.createWithExercises.mockResolvedValue(log as never);

		const useCase = new CompleteWorkoutSessionUseCase(
			sessionRepo as never,
			logRepo as never,
			prRepo as never
		);
		const input: CompleteWorkoutInput = {
			sessionId: 'sess1',
			userId: 'u1',
			notes: 'Great session'
		};
		const result = await useCase.execute(input);
		expect(result).toBe(log);
		// Expect update PR called
		expect(prRepo.upsert).toHaveBeenCalled();
		// expect delete called
		expect(sessionRepo.delete).toHaveBeenCalledWith('sess1');
	});
});
