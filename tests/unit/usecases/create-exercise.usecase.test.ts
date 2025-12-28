import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateExerciseUseCase } from '../../../src/core/usecases/exercise/create-exercise.usecase';
import { Exercise } from '../../../src/core/domain/exercise/exercise.entity';
import type { IExerciseRepository } from '../../../src/core/ports/repositories/exercise.repository.port';
import type { CreateExerciseDto } from '../../../src/core/domain/exercise/exercise.dto';

describe('CreateExerciseUseCase', () => {
	let exerciseRepository: IExerciseRepository;
	let useCase: CreateExerciseUseCase;

	beforeEach(() => {
		exerciseRepository = {
			findById: vi.fn(),
			findByUserId: vi.fn(),
			search: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new CreateExerciseUseCase(exerciseRepository);
	});

	describe('Valid Inputs', () => {
		it('should create exercise with all properties', async () => {
			const mockExercise = new Exercise(
				'exercise-1',
				'user-1',
				'Bench Press',
				'Chest pressing exercise',
				'intermediate',
				'Chest',
				'Barbell',
				'https://example.com/bench.jpg',
				'https://example.com/bench.gif',
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-1',
				name: 'Bench Press',
				description: 'Chest pressing exercise',
				difficulty: 'intermediate',
				muscleGroup: 'Chest',
				equipmentType: 'Barbell',
				imageUrl: 'https://example.com/bench.jpg',
				gifUrl: 'https://example.com/bench.gif'
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockExercise);
			expect(exerciseRepository.create).toHaveBeenCalledWith(input);
		});

		it('should create exercise with minimal properties', async () => {
			const mockExercise = new Exercise(
				'exercise-2',
				'user-2',
				'Push-ups',
				null,
				'beginner',
				'Chest',
				'Bodyweight',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-2',
				name: 'Push-ups',
				description: null,
				difficulty: 'beginner',
				muscleGroup: 'Chest',
				equipmentType: 'Bodyweight',
				imageUrl: null,
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockExercise);
		});

		it('should create exercise with beginner difficulty', async () => {
			const mockExercise = new Exercise(
				'exercise-3',
				'user-3',
				'Wall Push-ups',
				null,
				'beginner',
				'Chest',
				'Bodyweight',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-3',
				name: 'Wall Push-ups',
				description: null,
				difficulty: 'beginner',
				muscleGroup: 'Chest',
				equipmentType: 'Bodyweight',
				imageUrl: null,
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result.difficulty).toBe('beginner');
		});

		it('should create exercise with advanced difficulty', async () => {
			const mockExercise = new Exercise(
				'exercise-4',
				'user-4',
				'One Arm Push-ups',
				null,
				'advanced',
				'Chest',
				'Bodyweight',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-4',
				name: 'One Arm Push-ups',
				description: null,
				difficulty: 'advanced',
				muscleGroup: 'Chest',
				equipmentType: 'Bodyweight',
				imageUrl: null,
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result.difficulty).toBe('advanced');
		});

		it('should create exercise with different muscle groups', async () => {
			const mockExercise = new Exercise(
				'exercise-5',
				'user-5',
				'Squats',
				null,
				'intermediate',
				'Legs',
				'Barbell',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-5',
				name: 'Squats',
				description: null,
				difficulty: 'intermediate',
				muscleGroup: 'Legs',
				equipmentType: 'Barbell',
				imageUrl: null,
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result.muscleGroup).toBe('Legs');
		});

		it('should create exercise with different equipment types', async () => {
			const mockExercise = new Exercise(
				'exercise-6',
				'user-6',
				'Dumbbell Curl',
				null,
				'beginner',
				'Biceps',
				'Dumbbell',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-6',
				name: 'Dumbbell Curl',
				description: null,
				difficulty: 'beginner',
				muscleGroup: 'Biceps',
				equipmentType: 'Dumbbell',
				imageUrl: null,
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result.equipmentType).toBe('Dumbbell');
		});

		it('should create exercise with image URL only', async () => {
			const mockExercise = new Exercise(
				'exercise-7',
				'user-7',
				'Pull-ups',
				null,
				'intermediate',
				'Back',
				'Bar',
				'https://example.com/pullups.jpg',
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-7',
				name: 'Pull-ups',
				description: null,
				difficulty: 'intermediate',
				muscleGroup: 'Back',
				equipmentType: 'Bar',
				imageUrl: 'https://example.com/pullups.jpg',
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result.imageUrl).toBe('https://example.com/pullups.jpg');
			expect(result.gifUrl).toBeNull();
		});

		it('should create exercise with gif URL only', async () => {
			const mockExercise = new Exercise(
				'exercise-8',
				'user-8',
				'Deadlifts',
				null,
				'advanced',
				'Back',
				'Barbell',
				null,
				'https://example.com/deadlifts.gif',
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-8',
				name: 'Deadlifts',
				description: null,
				difficulty: 'advanced',
				muscleGroup: 'Back',
				equipmentType: 'Barbell',
				imageUrl: null,
				gifUrl: 'https://example.com/deadlifts.gif'
			};

			const result = await useCase.execute(input);

			expect(result.imageUrl).toBeNull();
			expect(result.gifUrl).toBe('https://example.com/deadlifts.gif');
		});
	});

	describe('Repository Integration', () => {
		it('should call repository create with correct data', async () => {
			const mockExercise = new Exercise(
				'exercise-9',
				'user-9',
				'Test Exercise',
				'Test description',
				'beginner',
				'Arms',
				'Cable',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-9',
				name: 'Test Exercise',
				description: 'Test description',
				difficulty: 'beginner',
				muscleGroup: 'Arms',
				equipmentType: 'Cable',
				imageUrl: null,
				gifUrl: null
			};

			await useCase.execute(input);

			expect(exerciseRepository.create).toHaveBeenCalledTimes(1);
			expect(exerciseRepository.create).toHaveBeenCalledWith(input);
		});

		it('should return the exercise from repository', async () => {
			const mockExercise = new Exercise(
				'exercise-10',
				'user-10',
				'Lat Pulldown',
				null,
				'intermediate',
				'Back',
				'Cable',
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(exerciseRepository.create).mockResolvedValue(mockExercise);

			const input: CreateExerciseDto = {
				userId: 'user-10',
				name: 'Lat Pulldown',
				description: null,
				difficulty: 'intermediate',
				muscleGroup: 'Back',
				equipmentType: 'Cable',
				imageUrl: null,
				gifUrl: null
			};

			const result = await useCase.execute(input);

			expect(result).toBe(mockExercise);
		});
	});
});
