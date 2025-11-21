import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExerciseService } from '$lib/services/exercises/exercise.service';
import type { ExerciseRepository } from '$lib/services/exercises/exercise.repository';
import type {
	Exercise,
	CreateExerciseInput,
	UpdateExerciseInput
} from '$lib/services/exercises/types';

describe('ExerciseService', () => {
	let service: ExerciseService;
	let mockRepository: ExerciseRepository;

	const mockExercise: Exercise = {
		id: '1',
		userId: 'user1',
		name: 'Bench Press',
		description: 'Chest exercise',
		difficulty: 'intermediate',
		muscleGroup: 'chest',
		equipmentType: 'barbell',
		imageUrl: null,
		videoUrl: null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByUserId: vi.fn(),
			findWithFilters: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		} as unknown as ExerciseRepository;

		service = new ExerciseService(mockRepository);
	});

	describe('getExerciseById', () => {
		it('should return exercise when found', async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(mockExercise);

			const result = await service.getExerciseById('1');

			expect(result).toEqual(mockExercise);
		});
	});

	describe('createExercise', () => {
		const validInput: CreateExerciseInput = {
			userId: 'user1',
			name: 'Squat',
			description: 'Leg exercise',
			difficulty: 'intermediate',
			muscleGroup: 'legs',
			equipmentType: 'barbell'
		};

		it('should create exercise with valid input', async () => {
			vi.mocked(mockRepository.create).mockResolvedValue(mockExercise);

			const result = await service.createExercise(validInput);

			expect(result).toEqual(mockExercise);
			expect(mockRepository.create).toHaveBeenCalledWith(validInput);
		});

		it('should throw error when name is empty', async () => {
			const invalidInput = { ...validInput, name: '  ' };

			await expect(service.createExercise(invalidInput)).rejects.toThrow(
				'Exercise name is required'
			);
		});

		it('should throw error when muscle group is empty', async () => {
			const invalidInput = { ...validInput, muscleGroup: '' };

			await expect(service.createExercise(invalidInput)).rejects.toThrow(
				'Muscle group is required'
			);
		});

		it('should throw error when equipment type is empty', async () => {
			const invalidInput = { ...validInput, equipmentType: '' };

			await expect(service.createExercise(invalidInput)).rejects.toThrow(
				'Equipment type is required'
			);
		});

		it('should throw error with invalid difficulty', async () => {
			type InvalidDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
			const invalidInput = {
				...validInput,
				difficulty: 'expert' as InvalidDifficulty
			} as CreateExerciseInput;

			await expect(service.createExercise(invalidInput)).rejects.toThrow(
				'Invalid difficulty level'
			);
		});
	});

	describe('updateExercise', () => {
		const updateInput: UpdateExerciseInput = {
			name: 'Updated Exercise'
		};

		it('should update exercise when user is owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(mockRepository.update).mockResolvedValue(mockExercise);

			const result = await service.updateExercise('1', 'user1', updateInput);

			expect(result).toEqual(mockExercise);
		});

		it('should throw error when exercise does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.updateExercise('999', 'user1', updateInput)).rejects.toThrow(
				'Exercise not found'
			);
		});

		it('should throw error when user is not owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(false);

			await expect(service.updateExercise('1', 'user2', updateInput)).rejects.toThrow(
				'Not authorized to update this exercise'
			);
		});

		it('should throw error when updating name to empty', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);

			await expect(service.updateExercise('1', 'user1', { name: '' })).rejects.toThrow(
				'Exercise name cannot be empty'
			);
		});

		it('should throw error with invalid difficulty update', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);

			type InvalidDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
			const invalidUpdate = { difficulty: 'expert' as InvalidDifficulty } as UpdateExerciseInput;

			await expect(service.updateExercise('1', 'user1', invalidUpdate)).rejects.toThrow(
				'Invalid difficulty level'
			);
		});
	});

	describe('deleteExercise', () => {
		it('should delete exercise when user is owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			await service.deleteExercise('1', 'user1');

			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should throw error when exercise does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.deleteExercise('999', 'user1')).rejects.toThrow('Exercise not found');
		});

		it('should throw error when user is not owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(false);

			await expect(service.deleteExercise('1', 'user2')).rejects.toThrow(
				'Not authorized to delete this exercise'
			);
		});
	});

	describe('getUserExercises', () => {
		it('should return exercises for user', async () => {
			const exercises = [mockExercise];
			vi.mocked(mockRepository.findByUserId).mockResolvedValue(exercises);

			const result = await service.getUserExercises('user1');

			expect(result).toEqual(exercises);
		});
	});

	describe('exerciseExists', () => {
		it('should return true when exercise exists', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);

			const result = await service.exerciseExists('1');

			expect(result).toBe(true);
		});

		it('should return false when exercise does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			const result = await service.exerciseExists('999');

			expect(result).toBe(false);
		});
	});
});
