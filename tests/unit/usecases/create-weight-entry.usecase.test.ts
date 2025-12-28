import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateWeightEntryUseCase } from '../../../src/core/usecases/weight/create-weight-entry.usecase';
import { WeightEntry } from '../../../src/core/domain/weight/weight-entry.entity';
import type { IWeightEntryRepository } from '../../../src/core/ports/repositories/weight-entry.repository.port';
import type { CreateWeightEntryDto } from '../../../src/core/domain/weight/weight-entry.dto';

describe('CreateWeightEntryUseCase', () => {
	let weightEntryRepository: IWeightEntryRepository;
	let useCase: CreateWeightEntryUseCase;

	beforeEach(() => {
		weightEntryRepository = {
			findById: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndDate: vi.fn(),
			upsertByDate: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new CreateWeightEntryUseCase(weightEntryRepository);
	});

	describe('Valid Inputs', () => {
		it('should create weight entry with all properties', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-1',
				'user-1',
				180.5,
				recordedAt,
				'Feeling good',
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-1',
				weight: 180.5,
				recordedAt,
				notes: 'Feeling good'
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockEntry);
			expect(weightEntryRepository.upsertByDate).toHaveBeenCalledWith(input);
		});

		it('should create weight entry without notes', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-2',
				'user-2',
				175.0,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-2',
				weight: 175.0,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result).toEqual(mockEntry);
		});

		it('should create weight entry with decimal weight', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-3',
				'user-3',
				165.75,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-3',
				weight: 165.75,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result.weight).toBe(165.75);
		});

		it('should create weight entry with integer weight', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-4',
				'user-4',
				200,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-4',
				weight: 200,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result.weight).toBe(200);
		});

		it('should create weight entry with different dates', async () => {
			const recordedAt = new Date('2024-01-20T10:30:00Z');
			const mockEntry = new WeightEntry(
				'weight-5',
				'user-5',
				170.5,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-5',
				weight: 170.5,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result.recordedAt).toEqual(recordedAt);
		});

		it('should create weight entry with long notes', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const longNotes =
				'Had a great workout today. Feeling strong. Ate clean all week. Sleep was good.';
			const mockEntry = new WeightEntry(
				'weight-6',
				'user-6',
				185.0,
				recordedAt,
				longNotes,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-6',
				weight: 185.0,
				recordedAt,
				notes: longNotes
			};

			const result = await useCase.execute(input);

			expect(result.notes).toBe(longNotes);
		});
	});

	describe('Upsert Behavior', () => {
		it('should use upsertByDate method for creating entries', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-7',
				'user-7',
				180.0,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-7',
				weight: 180.0,
				recordedAt,
				notes: null
			};

			await useCase.execute(input);

			expect(weightEntryRepository.upsertByDate).toHaveBeenCalledTimes(1);
			expect(weightEntryRepository.upsertByDate).toHaveBeenCalledWith(input);
		});

		it('should handle updating existing entry for the same date', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const updatedEntry = new WeightEntry(
				'weight-8',
				'user-8',
				182.5,
				recordedAt,
				'Updated weight',
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(updatedEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-8',
				weight: 182.5,
				recordedAt,
				notes: 'Updated weight'
			};

			const result = await useCase.execute(input);

			expect(result.weight).toBe(182.5);
			expect(result.notes).toBe('Updated weight');
		});
	});

	describe('Repository Integration', () => {
		it('should call repository upsertByDate with correct data', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-9',
				'user-9',
				175.5,
				recordedAt,
				'Test notes',
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-9',
				weight: 175.5,
				recordedAt,
				notes: 'Test notes'
			};

			await useCase.execute(input);

			expect(weightEntryRepository.upsertByDate).toHaveBeenCalledTimes(1);
			expect(weightEntryRepository.upsertByDate).toHaveBeenCalledWith(input);
		});

		it('should return the entry from repository', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-10',
				'user-10',
				190.0,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-10',
				weight: 190.0,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result).toBe(mockEntry);
		});
	});

	describe('Edge Cases', () => {
		it('should handle very high weights', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-11',
				'user-11',
				350.5,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-11',
				weight: 350.5,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result.weight).toBe(350.5);
		});

		it('should handle very low weights', async () => {
			const recordedAt = new Date('2024-01-15T08:00:00Z');
			const mockEntry = new WeightEntry(
				'weight-12',
				'user-12',
				100.25,
				recordedAt,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(weightEntryRepository.upsertByDate).mockResolvedValue(mockEntry);

			const input: CreateWeightEntryDto = {
				userId: 'user-12',
				weight: 100.25,
				recordedAt,
				notes: null
			};

			const result = await useCase.execute(input);

			expect(result.weight).toBe(100.25);
		});
	});
});
