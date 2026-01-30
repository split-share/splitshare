import { describe, it, expect, vi, type Mocked } from 'vitest';
import { GetActiveWorkoutSessionUseCase } from '$core/usecases/workout/get-active-workout-session.usecase';
import type { IWorkoutSessionRepository } from '$core/ports/repositories/workout-session.repository.port';
import type { WorkoutSessionWithDetailsDto } from '$core/domain/workout/workout-session.dto';

describe('GetActiveWorkoutSessionUseCase', () => {
	const createMockRepo = (): Mocked<IWorkoutSessionRepository> =>
		({
			findActiveByUserIdWithDetails: vi.fn(),
			isOwnedByUser: vi.fn(),
			delete: vi.fn(),
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findActiveByUserId: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			exists: vi.fn()
		}) as unknown as Mocked<IWorkoutSessionRepository>;

	it('returns session details', async () => {
		const repo = createMockRepo();
		const data: WorkoutSessionWithDetailsDto = {
			session: {
				id: 'sess1',
				userId: 'u1',
				splitId: 's1',
				dayId: 'd1',
				currentExerciseIndex: 0,
				currentSetIndex: 0,
				phase: 'exercise',
				exerciseElapsedSeconds: 0,
				restRemainingSeconds: null,
				startedAt: new Date(),
				pausedAt: null,
				lastUpdatedAt: new Date(),
				completedSets: [],
				createdAt: new Date()
			},
			split: { id: 's1', title: 'Test Split' },
			day: { id: 'd1', name: 'Day 1', dayNumber: 1 },
			exercises: []
		};
		repo.findActiveByUserIdWithDetails.mockResolvedValue(data);
		const useCase = new GetActiveWorkoutSessionUseCase(repo);
		const result = await useCase.execute('u1');
		expect(result).toBe(data);
	});
});
