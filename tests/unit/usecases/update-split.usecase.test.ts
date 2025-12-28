import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateSplitUseCase } from '../../../src/core/usecases/split/update-split.usecase';
import { Split } from '../../../src/core/domain/split/split.entity';
import { NotFoundError, ForbiddenError } from '../../../src/core/domain/common/errors';
import type { ISplitRepository } from '../../../src/core/ports/repositories/split.repository.port';
import type { UpdateSplitDto } from '../../../src/core/domain/split/split.dto';

describe('UpdateSplitUseCase', () => {
	let splitRepository: ISplitRepository;
	let useCase: UpdateSplitUseCase;

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

		useCase = new UpdateSplitUseCase(splitRepository);
	});

	describe('Successful Updates', () => {
		it('should update split when user is owner', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Updated Split',
				'Updated description',
				true,
				false,
				'advanced',
				5,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.exists).mockResolvedValue(true);
			vi.mocked(splitRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(splitRepository.update).mockResolvedValue(mockSplit);

			const updateData: UpdateSplitDto = {
				title: 'Updated Split',
				description: 'Updated description',
				difficulty: 'advanced',
				duration: 5
			};

			const result = await useCase.execute('split-1', 'user-1', updateData);

			expect(result).toEqual(mockSplit);
			expect(splitRepository.exists).toHaveBeenCalledWith('split-1');
			expect(splitRepository.isOwnedByUser).toHaveBeenCalledWith('split-1', 'user-1');
			expect(splitRepository.update).toHaveBeenCalledWith('split-1', updateData);
		});

		it('should update only title', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'New Title',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.exists).mockResolvedValue(true);
			vi.mocked(splitRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(splitRepository.update).mockResolvedValue(mockSplit);

			const result = await useCase.execute('split-1', 'user-1', { title: 'New Title' });

			expect(result).toEqual(mockSplit);
			expect(splitRepository.update).toHaveBeenCalledWith('split-1', { title: 'New Title' });
		});

		it('should update multiple fields', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'PPL',
				'Push Pull Legs',
				false,
				false,
				'intermediate',
				6,
				null,
				['strength', 'hypertrophy'],
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.exists).mockResolvedValue(true);
			vi.mocked(splitRepository.isOwnedByUser).mockResolvedValue(true);
			vi.mocked(splitRepository.update).mockResolvedValue(mockSplit);

			const updateData: UpdateSplitDto = {
				title: 'PPL',
				description: 'Push Pull Legs',
				isPublic: false,
				difficulty: 'intermediate',
				duration: 6,
				tags: ['strength', 'hypertrophy']
			};

			const result = await useCase.execute('split-1', 'user-1', updateData);

			expect(result).toEqual(mockSplit);
		});
	});

	describe('Error Cases', () => {
		it('should throw NotFoundError when split does not exist', async () => {
			vi.mocked(splitRepository.exists).mockResolvedValue(false);

			await expect(useCase.execute('nonexistent-id', 'user-1', { title: 'Test' })).rejects.toThrow(
				NotFoundError
			);

			expect(splitRepository.isOwnedByUser).not.toHaveBeenCalled();
			expect(splitRepository.update).not.toHaveBeenCalled();
		});

		it('should throw ForbiddenError when user is not the owner', async () => {
			vi.mocked(splitRepository.exists).mockResolvedValue(true);
			vi.mocked(splitRepository.isOwnedByUser).mockResolvedValue(false);

			await expect(useCase.execute('split-1', 'other-user', { title: 'Test' })).rejects.toThrow(
				ForbiddenError
			);

			expect(splitRepository.update).not.toHaveBeenCalled();
		});

		it('should include split ID in NotFoundError message', async () => {
			vi.mocked(splitRepository.exists).mockResolvedValue(false);

			try {
				await useCase.execute('split-123', 'user-1', { title: 'Test' });
				expect.fail('Should have thrown NotFoundError');
			} catch (error) {
				expect(error).toBeInstanceOf(NotFoundError);
				expect((error as NotFoundError).message).toContain('split-123');
			}
		});

		it('should include resource type in ForbiddenError', async () => {
			vi.mocked(splitRepository.exists).mockResolvedValue(true);
			vi.mocked(splitRepository.isOwnedByUser).mockResolvedValue(false);

			try {
				await useCase.execute('split-1', 'user-1', { title: 'Test' });
				expect.fail('Should have thrown ForbiddenError');
			} catch (error) {
				expect(error).toBeInstanceOf(ForbiddenError);
			}
		});
	});

	describe('Update Variations', () => {
		beforeEach(() => {
			vi.mocked(splitRepository.exists).mockResolvedValue(true);
			vi.mocked(splitRepository.isOwnedByUser).mockResolvedValue(true);
		});

		it('should handle updating isPublic to false', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Private Split',
				null,
				false,
				false,
				'beginner',
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.update).mockResolvedValue(mockSplit);

			const result = await useCase.execute('split-1', 'user-1', { isPublic: false });

			expect(result.isPublic).toBe(false);
		});

		it('should handle updating tags to null', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Split',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.update).mockResolvedValue(mockSplit);

			const result = await useCase.execute('split-1', 'user-1', { tags: null });

			expect(result.tags).toBeNull();
		});

		it('should handle updating description to null', async () => {
			const mockSplit = new Split(
				'split-1',
				'user-1',
				'Split',
				null,
				true,
				false,
				'beginner',
				null,
				null,
				null,
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.update).mockResolvedValue(mockSplit);

			const result = await useCase.execute('split-1', 'user-1', { description: null });

			expect(result.description).toBeNull();
		});
	});
});
