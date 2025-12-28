import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetProgressionSuggestionsUseCase } from '../../../src/core/usecases/workout/get-progression-suggestions.usecase';
import { Exercise } from '../../../src/core/domain/exercise/exercise.entity';
import { PersonalRecord } from '../../../src/core/domain/workout/personal-record.entity';
import type { IWorkoutLogRepository } from '../../../src/core/ports/repositories/workout-log.repository.port';
import type { IPersonalRecordRepository } from '../../../src/core/ports/repositories/personal-record.repository.port';
import type { IExerciseRepository } from '../../../src/core/ports/repositories/exercise.repository.port';

describe('GetProgressionSuggestionsUseCase', () => {
	let workoutLogRepository: IWorkoutLogRepository;
	let personalRecordRepository: IPersonalRecordRepository;
	let exerciseRepository: IExerciseRepository;
	let useCase: GetProgressionSuggestionsUseCase;

	const mockExercise = (muscleGroup: string) =>
		new Exercise(
			'ex-1',
			'user-1',
			'Bench Press',
			null,
			'intermediate', // difficulty
			muscleGroup, // muscleGroup
			'barbell', // equipmentType
			null,
			null,
			new Date(),
			new Date()
		);

	const mockPersonalRecord = (weight: number, reps: number) =>
		new PersonalRecord('pr-1', 'user-1', 'ex-1', weight, reps, new Date(), new Date(), new Date());

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
			getUserStats: vi.fn(),
			findExerciseHistory: vi.fn()
		};

		personalRecordRepository = {
			findById: vi.fn(),
			findByUserIdAndExerciseId: vi.fn(),
			findByUserId: vi.fn(),
			upsert: vi.fn(),
			delete: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		exerciseRepository = {
			findById: vi.fn(),
			findByUserId: vi.fn(),
			findWithFilters: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new GetProgressionSuggestionsUseCase(
			workoutLogRepository,
			personalRecordRepository,
			exerciseRepository
		);
	});

	describe('No History', () => {
		it('should return no_history when exercise has no previous performances', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('chest'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.size).toBe(1);
			const suggestion = result.get('ex-1');
			expect(suggestion).toBeDefined();
			expect(suggestion?.reason).toBe('no_history');
			expect(suggestion?.suggestedWeight).toBeNull();
			expect(suggestion?.currentPR).toBeNull();
		});
	});

	describe('Single Session', () => {
		it('should return maintain when only one session exists', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('chest'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(
				mockPersonalRecord(80, 10)
			);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([
				{ date: new Date(), weight: 80, sets: 3, reps: '10' }
			]);

			const result = await useCase.execute('user-1', ['ex-1']);

			const suggestion = result.get('ex-1');
			expect(suggestion?.reason).toBe('maintain');
			expect(suggestion?.suggestedWeight).toBe(80);
			expect(suggestion?.consecutiveSuccesses).toBe(1);
		});
	});

	describe('Ready to Progress', () => {
		it('should suggest progression after 2 consecutive successful sessions', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('chest'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(
				mockPersonalRecord(80, 10)
			);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([
				{ date: new Date(), weight: 80, sets: 3, reps: '10' },
				{ date: new Date(Date.now() - 86400000), weight: 80, sets: 3, reps: '10' }
			]);

			const result = await useCase.execute('user-1', ['ex-1']);

			const suggestion = result.get('ex-1');
			expect(suggestion?.reason).toBe('ready_to_progress');
			expect(suggestion?.suggestedWeight).toBe(82.5); // 80 + 2.5 for compound
			expect(suggestion?.increment).toBe(2.5);
			expect(suggestion?.consecutiveSuccesses).toBe(2);
		});

		it('should use 1.25kg increment for isolation exercises', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('biceps'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(
				mockPersonalRecord(20, 12)
			);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([
				{ date: new Date(), weight: 20, sets: 3, reps: '12' },
				{ date: new Date(Date.now() - 86400000), weight: 20, sets: 3, reps: '12' }
			]);

			const result = await useCase.execute('user-1', ['ex-1']);

			const suggestion = result.get('ex-1');
			expect(suggestion?.reason).toBe('ready_to_progress');
			expect(suggestion?.suggestedWeight).toBe(21.25); // 20 + 1.25 for isolation
			expect(suggestion?.increment).toBe(1.25);
		});
	});

	describe('Inconsistent Sessions', () => {
		it('should return inconsistent when weights differ between sessions', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('chest'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(
				mockPersonalRecord(80, 10)
			);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([
				{ date: new Date(), weight: 80, sets: 3, reps: '10' },
				{ date: new Date(Date.now() - 86400000), weight: 75, sets: 3, reps: '10' }
			]);

			const result = await useCase.execute('user-1', ['ex-1']);

			const suggestion = result.get('ex-1');
			expect(suggestion?.reason).toBe('inconsistent');
			expect(suggestion?.suggestedWeight).toBe(80);
			expect(suggestion?.consecutiveSuccesses).toBe(1);
		});
	});

	describe('Muscle Group Detection', () => {
		it('should use compound increment for chest exercises', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('chest'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.get('ex-1')?.increment).toBe(2.5);
		});

		it('should use compound increment for back exercises', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('back'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.get('ex-1')?.increment).toBe(2.5);
		});

		it('should use compound increment for legs exercises', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('legs'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.get('ex-1')?.increment).toBe(2.5);
		});

		it('should use isolation increment for shoulders exercises', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('shoulders'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.get('ex-1')?.increment).toBe(1.25);
		});

		it('should use isolation increment for triceps exercises', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('triceps'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.get('ex-1')?.increment).toBe(1.25);
		});
	});

	describe('Multiple Exercises', () => {
		it('should return suggestions for all exercises', async () => {
			const exercise1 = new Exercise(
				'ex-1',
				'user-1',
				'Bench Press',
				null,
				'intermediate', // difficulty
				'chest', // muscleGroup
				'barbell', // equipmentType
				null,
				null,
				new Date(),
				new Date()
			);
			const exercise2 = new Exercise(
				'ex-2',
				'user-1',
				'Bicep Curl',
				null,
				'beginner', // difficulty
				'biceps', // muscleGroup
				'dumbbell', // equipmentType
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.findById)
				.mockResolvedValueOnce(exercise1)
				.mockResolvedValueOnce(exercise2);
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([]);

			const result = await useCase.execute('user-1', ['ex-1', 'ex-2']);

			expect(result.size).toBe(2);
			expect(result.has('ex-1')).toBe(true);
			expect(result.has('ex-2')).toBe(true);
		});
	});

	describe('Edge Cases', () => {
		it('should handle null weight in history', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(mockExercise('chest'));
			vi.mocked(personalRecordRepository.findByUserIdAndExerciseId).mockResolvedValue(undefined);
			vi.mocked(workoutLogRepository.findExerciseHistory).mockResolvedValue([
				{ date: new Date(), weight: null, sets: 3, reps: '10' }
			]);

			const result = await useCase.execute('user-1', ['ex-1']);

			const suggestion = result.get('ex-1');
			expect(suggestion?.reason).toBe('maintain');
			expect(suggestion?.consecutiveSuccesses).toBe(0);
		});

		it('should skip exercises that do not exist', async () => {
			vi.mocked(exerciseRepository.findById).mockResolvedValue(undefined);

			const result = await useCase.execute('user-1', ['ex-1']);

			expect(result.size).toBe(0);
		});

		it('should handle empty exercise list', async () => {
			const result = await useCase.execute('user-1', []);

			expect(result.size).toBe(0);
		});
	});
});
