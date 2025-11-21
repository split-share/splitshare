import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SplitService } from '$lib/services/splits/split.service';
import type { SplitRepository } from '$lib/services/splits/split.repository';
import type { Split, CreateSplitInput, UpdateSplitInput } from '$lib/services/splits/types';

describe('SplitService', () => {
	let service: SplitService;
	let mockRepository: SplitRepository;

	const mockSplit: Split = {
		id: '1',
		userId: 'user1',
		title: 'Push Pull Legs',
		description: 'PPL split',
		isPublic: true,
		isDefault: false,
		difficulty: 'intermediate',
		duration: 60,
		imageUrl: null,
		tags: ['strength', 'hypertrophy'],
		createdAt: new Date(),
		updatedAt: new Date()
	};

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findWithFilters: vi.fn(),
			findDaysBySplitId: vi.fn(),
			createWithDays: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		} as unknown as SplitRepository;

		service = new SplitService(mockRepository);
	});

	describe('createSplit', () => {
		const validInput: CreateSplitInput = {
			userId: 'user1',
			title: 'Test Split',
			difficulty: 'beginner',
			days: [
				{
					dayNumber: 1,
					name: 'Chest Day',
					isRestDay: false,
					exercises: [
						{
							exerciseId: 'ex1',
							sets: 3,
							reps: '10',
							order: 1
						}
					]
				}
			]
		};

		it('should create split with valid input', async () => {
			vi.mocked(mockRepository.createWithDays).mockResolvedValue(mockSplit);

			const result = await service.createSplit(validInput);

			expect(result).toEqual(mockSplit);
			expect(mockRepository.createWithDays).toHaveBeenCalledWith(validInput);
		});

		it('should throw error when title is empty', async () => {
			const invalidInput = { ...validInput, title: '  ' };

			await expect(service.createSplit(invalidInput)).rejects.toThrow('Split title is required');
		});

		it('should throw error with invalid difficulty', async () => {
			type InvalidDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
			const invalidInput = {
				...validInput,
				difficulty: 'expert' as InvalidDifficulty
			} as CreateSplitInput;

			await expect(service.createSplit(invalidInput)).rejects.toThrow('Invalid difficulty level');
		});

		it('should throw error when no days provided', async () => {
			const invalidInput = { ...validInput, days: [] };

			await expect(service.createSplit(invalidInput)).rejects.toThrow(
				'At least one day is required'
			);
		});

		it('should throw error with duplicate day numbers', async () => {
			const invalidInput = {
				...validInput,
				days: [validInput.days[0], { ...validInput.days[0], dayNumber: 1 }]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow('Duplicate day number: 1');
		});

		it('should throw error when day number is invalid', async () => {
			const invalidInput = {
				...validInput,
				days: [{ ...validInput.days[0], dayNumber: 0 }]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow(
				'Day number must be positive'
			);
		});

		it('should throw error when day name is empty', async () => {
			const invalidInput = {
				...validInput,
				days: [{ ...validInput.days[0], name: '' }]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow('Day name is required');
		});

		it('should throw error when non-rest day has no exercises', async () => {
			const invalidInput = {
				...validInput,
				days: [{ ...validInput.days[0], exercises: [] }]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow(
				'Day 1 must have at least one exercise or be marked as rest day'
			);
		});

		it('should allow rest day with no exercises', async () => {
			const validRestDayInput = {
				...validInput,
				days: [
					{
						dayNumber: 1,
						name: 'Rest Day',
						isRestDay: true,
						exercises: []
					}
				]
			};

			vi.mocked(mockRepository.createWithDays).mockResolvedValue(mockSplit);

			await service.createSplit(validRestDayInput);

			expect(mockRepository.createWithDays).toHaveBeenCalled();
		});

		it('should throw error when exercise has invalid sets', async () => {
			const invalidInput = {
				...validInput,
				days: [
					{
						...validInput.days[0],
						exercises: [{ ...validInput.days[0].exercises[0], sets: 0 }]
					}
				]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow(
				'Exercise must have at least 1 set'
			);
		});

		it('should throw error when exercise has empty reps', async () => {
			const invalidInput = {
				...validInput,
				days: [
					{
						...validInput.days[0],
						exercises: [{ ...validInput.days[0].exercises[0], reps: '' }]
					}
				]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow('Exercise reps are required');
		});

		it('should throw error with duplicate exercise order', async () => {
			const invalidInput = {
				...validInput,
				days: [
					{
						...validInput.days[0],
						exercises: [
							validInput.days[0].exercises[0],
							{ ...validInput.days[0].exercises[0], exerciseId: 'ex2', order: 1 }
						]
					}
				]
			};

			await expect(service.createSplit(invalidInput)).rejects.toThrow(
				'Duplicate exercise order in day 1'
			);
		});
	});

	describe('updateSplit', () => {
		const updateInput: UpdateSplitInput = {
			title: 'Updated Split'
		};

		it('should update split when user is owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(mockRepository.update).mockResolvedValue(mockSplit);

			const result = await service.updateSplit('1', 'user1', updateInput);

			expect(result).toEqual(mockSplit);
		});

		it('should throw error when split does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.updateSplit('999', 'user1', updateInput)).rejects.toThrow(
				'Split not found'
			);
		});

		it('should throw error when user is not owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(false);

			await expect(service.updateSplit('1', 'user2', updateInput)).rejects.toThrow(
				'Not authorized to update this split'
			);
		});

		it('should throw error when updating title to empty', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);

			await expect(service.updateSplit('1', 'user1', { title: '' })).rejects.toThrow(
				'Split title cannot be empty'
			);
		});
	});

	describe('deleteSplit', () => {
		it('should delete split when user is owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			await service.deleteSplit('1', 'user1');

			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should throw error when split does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.deleteSplit('999', 'user1')).rejects.toThrow('Split not found');
		});

		it('should throw error when user is not owner', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(false);

			await expect(service.deleteSplit('1', 'user2')).rejects.toThrow(
				'Not authorized to delete this split'
			);
		});
	});

	describe('getUserSplits', () => {
		it('should return splits for user', async () => {
			const splits = [mockSplit];
			vi.mocked(mockRepository.findByUserId).mockResolvedValue(splits);

			const result = await service.getUserSplits('user1');

			expect(result).toEqual(splits);
		});
	});

	describe('splitExists', () => {
		it('should return true when split exists', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);

			const result = await service.splitExists('1');

			expect(result).toBe(true);
		});

		it('should return false when split does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			const result = await service.splitExists('999');

			expect(result).toBe(false);
		});
	});

	describe('canUserModify', () => {
		it('should return true when user is owner', async () => {
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(true);

			const result = await service.canUserModify('1', 'user1');

			expect(result).toBe(true);
		});

		it('should return false when user is not owner', async () => {
			vi.mocked(mockRepository.isOwnedByUser).mockResolvedValue(false);

			const result = await service.canUserModify('1', 'user2');

			expect(result).toBe(false);
		});
	});
});
