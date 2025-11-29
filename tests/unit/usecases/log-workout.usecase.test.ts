import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogWorkoutUseCase } from '../../../src/core/usecases/workout/log-workout.usecase';
import { WorkoutLog } from '../../../src/core/domain/workout/workout-log.entity';
import { PersonalRecord } from '../../../src/core/domain/workout/personal-record.entity';
import type { IWorkoutLogRepository } from '../../../src/core/ports/repositories/workout-log.repository.port';
import type { IPersonalRecordRepository } from '../../../src/core/ports/repositories/personal-record.repository.port';

describe('LogWorkoutUseCase', () => {
	let workoutLogRepository: IWorkoutLogRepository;
	let personalRecordRepository: IPersonalRecordRepository;
	let useCase: LogWorkoutUseCase;

	beforeEach(() => {
		workoutLogRepository = {
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndDateRange: vi.fn(),
			createWithExercises: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn(),
			getUserStats: vi.fn()
		};

		personalRecordRepository = {
			findById: vi.fn(),
			findByUserIdAndExerciseId: vi.fn(),
			findByUserId: vi.fn(),
			upsert: vi.fn(),
			delete: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new LogWorkoutUseCase(workoutLogRepository, personalRecordRepository);
	});

	it('should log workout successfully', async () => {
		const mockWorkoutLog = new WorkoutLog(
			'log-1',
			'user-1',
			'split-1',
			'day-1',
			60,
			'Great workout',
			new Date(),
			new Date()
		);

		vi.mocked(workoutLogRepository.createWithExercises).mockResolvedValue(mockWorkoutLog);
		vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);

		const result = await useCase.execute({
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1',
			duration: 60,
			notes: 'Great workout',
			completedAt: new Date(),
			exercises: [
				{
					exerciseId: 'ex-1',
					sets: 3,
					reps: '10',
					weight: 100,
					notes: null
				}
			]
		});

		expect(result).toEqual(mockWorkoutLog);
		expect(workoutLogRepository.createWithExercises).toHaveBeenCalled();
		expect(personalRecordRepository.upsert).toHaveBeenCalledWith(
			'user-1',
			'ex-1',
			100,
			10,
			expect.any(Date)
		);
	});

	it('should throw error for invalid sets', async () => {
		await expect(
			useCase.execute({
				userId: 'user-1',
				splitId: 'split-1',
				dayId: 'day-1',
				duration: 60,
				notes: null,
				completedAt: new Date(),
				exercises: [
					{
						exerciseId: 'ex-1',
						sets: 0,
						reps: '10',
						weight: 100
					}
				]
			})
		).rejects.toThrow('Sets must be at least 1');
	});

	it('should throw error for negative weight', async () => {
		await expect(
			useCase.execute({
				userId: 'user-1',
				splitId: 'split-1',
				dayId: 'day-1',
				duration: 60,
				notes: null,
				completedAt: new Date(),
				exercises: [
					{
						exerciseId: 'ex-1',
						sets: 3,
						reps: '10',
						weight: -10
					}
				]
			})
		).rejects.toThrow('Weight cannot be negative');
	});

	it('should update PR when weight is higher', async () => {
		const mockWorkoutLog = new WorkoutLog(
			'log-1',
			'user-1',
			'split-1',
			'day-1',
			60,
			null,
			new Date(),
			new Date()
		);

		vi.mocked(workoutLogRepository.createWithExercises).mockResolvedValue(mockWorkoutLog);
		const mockPR = new (class {
			id = 'pr-1';
			userId = 'user-1';
			exerciseId = 'ex-1';
			weight = 90;
			reps = 10;
			achievedAt = new Date();
			createdAt = new Date();
			updatedAt = new Date();
			calculateOneRepMax() {
				return 120;
			}
			updateRecord() {}
		})();

		vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(
			mockPR as unknown as PersonalRecord
		);

		await useCase.execute({
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1',
			duration: 60,
			notes: null,
			completedAt: new Date(),
			exercises: [
				{
					exerciseId: 'ex-1',
					sets: 3,
					reps: '10',
					weight: 100
				}
			]
		});

		expect(personalRecordRepository.upsert).toHaveBeenCalledWith(
			'user-1',
			'ex-1',
			100,
			10,
			expect.any(Date)
		);
	});
});
