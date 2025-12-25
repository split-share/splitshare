import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSplitUseCase } from '../../../src/core/usecases/split/create-split.usecase';
import { Split } from '../../../src/core/domain/split/split.entity';
import type { ISplitRepository } from '../../../src/core/ports/repositories/split.repository.port';
import type { CreateSplitDto } from '../../../src/core/domain/split/split.dto';

describe('CreateSplitUseCase', () => {
	let splitRepository: ISplitRepository;
	let useCase: CreateSplitUseCase;

	beforeEach(() => {
		splitRepository = {
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findWithFilters: vi.fn(),
			createWithDays: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new CreateSplitUseCase(splitRepository);
	});

	describe('Valid Inputs', () => {
		it('should create split with exercises that have weight', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Test Split',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.createWithDays).mockResolvedValue(mockSplit);

			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: [
					{
						dayNumber: 1,
						name: 'Day 1',
						isRestDay: false,
						exercises: [
							{
								exerciseName: 'Bench Press',
								sets: 3,
								reps: '8-12',
								order: 0,
								weight: 100
							}
						]
					}
				]
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockSplit);
			expect(splitRepository.createWithDays).toHaveBeenCalledWith(input);
		});

		it('should create split with exercises without weight', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Test Split',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.createWithDays).mockResolvedValue(mockSplit);

			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: [
					{
						dayNumber: 1,
						name: 'Day 1',
						isRestDay: false,
						exercises: [
							{
								exerciseName: 'Planks',
								sets: 3,
								reps: '60s',
								order: 0,
								weight: null
							}
						]
					}
				]
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockSplit);
		});

		it('should create split with mixed exercises (some with weight, some without)', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Test Split',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.createWithDays).mockResolvedValue(mockSplit);

			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: [
					{
						dayNumber: 1,
						name: 'Day 1',
						isRestDay: false,
						exercises: [
							{
								exerciseName: 'Bench Press',
								sets: 3,
								reps: '8-12',
								order: 0,
								weight: 100
							},
							{
								exerciseName: 'Push-Ups',
								sets: 3,
								reps: '15',
								order: 1,
								weight: null
							}
						]
					}
				]
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockSplit);
		});

		it('should accept decimal weight', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Test Split',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.createWithDays).mockResolvedValue(mockSplit);

			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: [
					{
						dayNumber: 1,
						name: 'Day 1',
						isRestDay: false,
						exercises: [
							{
								exerciseName: 'Bench Press',
								sets: 3,
								reps: '8-12',
								order: 0,
								weight: 52.5
							}
						]
					}
				]
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockSplit);
		});
	});

	describe('Business Rule Validation', () => {
		it('should throw error if no days provided', async () => {
			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: []
			};

			await expect(useCase.execute(input)).rejects.toThrow('At least one day is required');
		});

		it('should throw error for duplicate day numbers', async () => {
			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: [
					{
						dayNumber: 1,
						name: 'Day 1',
						isRestDay: false,
						exercises: [
							{
								exerciseName: 'Bench Press',
								sets: 3,
								reps: '8-12',
								order: 0
							}
						]
					},
					{
						dayNumber: 1,
						name: 'Day 1 Duplicate',
						isRestDay: false,
						exercises: [
							{
								exerciseName: 'Squats',
								sets: 3,
								reps: '8-12',
								order: 0
							}
						]
					}
				]
			};

			await expect(useCase.execute(input)).rejects.toThrow('Duplicate day number: 1');
		});

		it('should throw error for non-rest day without exercises', async () => {
			const input: CreateSplitDto = {
				userId: 'user-1',
				title: 'Test Split',
				difficulty: 'beginner',
				days: [
					{
						dayNumber: 1,
						name: 'Day 1',
						isRestDay: false,
						exercises: []
					}
				]
			};

			await expect(useCase.execute(input)).rejects.toThrow(
				'Day 1 must have at least one exercise or be marked as rest day'
			);
		});
	});
});
