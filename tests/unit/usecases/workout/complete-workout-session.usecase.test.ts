import { describe, it, expect, vi, type Mocked } from 'vitest';
import { CompleteWorkoutSessionUseCase } from '$core/usecases/workout/complete-workout-session.usecase';
import type { CompleteWorkoutInput } from '$core/usecases/workout/complete-workout-session.usecase';
import type { IWorkoutSessionRepository } from '$core/ports/repositories/workout-session.repository.port';
import type { IWorkoutLogRepository } from '$core/ports/repositories/workout-log.repository.port';
import type { IPersonalRecordRepository } from '$core/ports/repositories/personal-record.repository.port';
import { WorkoutLog } from '$core/domain/workout/workout-log.entity';
import type { WorkoutSessionWithDetailsDto } from '$core/domain/workout/workout-session.dto';
import type { CompletedSetData } from '$core/domain/workout/workout-session.entity';

describe('CompleteWorkoutSessionUseCase', () => {
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

	const createMockLogRepo = (): Mocked<IWorkoutLogRepository> =>
		({
			createWithExercises: vi.fn(),
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndDateRange: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn(),
			getUserStats: vi.fn(),
			findExerciseHistory: vi.fn(),
			hasCompletedWorkoutForSplit: vi.fn()
		}) as unknown as Mocked<IWorkoutLogRepository>;

	const createMockPRRepo = (): Mocked<IPersonalRecordRepository> =>
		({
			findById: vi.fn(),
			findByUserIdAndExerciseId: vi.fn(),
			findByUserId: vi.fn(),
			upsert: vi.fn(),
			delete: vi.fn(),
			isOwnedByUser: vi.fn()
		}) as unknown as Mocked<IPersonalRecordRepository>;

	it('creates log and updates personal records', async () => {
		const sessionRepo = createMockRepo();
		const logRepo = createMockLogRepo();
		const prRepo = createMockPRRepo();

		const completedSets: CompletedSetData[] = [
			{
				exerciseIndex: 0,
				setIndex: 0,
				weight: 100,
				reps: 10,
				notes: null,
				completedAt: new Date()
			},
			{ exerciseIndex: 0, setIndex: 1, weight: 110, reps: 8, notes: null, completedAt: new Date() }
		];

		const mockSession: WorkoutSessionWithDetailsDto = {
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
				startedAt: new Date(Date.now() - 30 * 60 * 1000),
				pausedAt: null,
				lastUpdatedAt: new Date(),
				completedSets,
				createdAt: new Date()
			},
			split: { id: 's1', title: 'Test Split' },
			day: { id: 'd1', name: 'Day 1', dayNumber: 1 },
			exercises: [
				{
					id: 'de1',
					exerciseId: 'e1',
					exerciseName: 'Bench Press',
					sets: 3,
					reps: '8-12',
					restTime: 60,
					weight: '100',
					notes: null,
					order: 0,
					groupId: null,
					groupType: null,
					exercise: {
						id: 'e1',
						name: 'Bench Press',
						description: null,
						muscleGroup: 'Chest',
						equipmentType: 'Barbell',
						difficulty: 'intermediate',
						imageUrl: null,
						gifUrl: null
					}
				}
			]
		};

		sessionRepo.findActiveByUserIdWithDetails.mockResolvedValue(mockSession);

		// No existing PRs
		prRepo.findByUserIdAndExerciseId.mockResolvedValue(undefined);

		const log = new WorkoutLog(
			'log1',
			'u1',
			's1',
			'd1',
			30,
			'Great session',
			new Date(),
			new Date()
		);

		logRepo.createWithExercises.mockResolvedValue(log);

		const useCase = new CompleteWorkoutSessionUseCase(sessionRepo, logRepo, prRepo);

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
