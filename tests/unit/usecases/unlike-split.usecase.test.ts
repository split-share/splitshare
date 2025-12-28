import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnlikeSplitUseCase } from '../../../src/core/usecases/split/unlike-split.usecase';
import { NotFoundError } from '../../../src/core/domain/common/errors';
import type { ILikeRepository } from '../../../src/core/ports/repositories/like.repository.port';
import { Like } from '../../../src/core/domain/split/like.entity';

describe('UnlikeSplitUseCase', () => {
	let likeRepository: ILikeRepository;
	let useCase: UnlikeSplitUseCase;

	beforeEach(() => {
		likeRepository = {
			findByUserIdAndSplitId: vi.fn(),
			deleteByUserIdAndSplitId: vi.fn(),
			countBySplitId: vi.fn()
		};

		useCase = new UnlikeSplitUseCase(likeRepository);
	});

	describe('Successful Unlike', () => {
		it('should unlike a split when like exists', async () => {
			const mockLike = new Like('like-1', 'user-1', 'split-1', new Date());

			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(mockLike);
			vi.mocked(likeRepository.deleteByUserIdAndSplitId).mockResolvedValue();

			await useCase.execute('user-1', 'split-1');

			expect(likeRepository.findByUserIdAndSplitId).toHaveBeenCalledWith('user-1', 'split-1');
			expect(likeRepository.deleteByUserIdAndSplitId).toHaveBeenCalledWith('user-1', 'split-1');
		});

		it('should not return any value', async () => {
			const mockLike = new Like('like-1', 'user-1', 'split-1', new Date());

			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(mockLike);
			vi.mocked(likeRepository.deleteByUserIdAndSplitId).mockResolvedValue();

			const result = await useCase.execute('user-1', 'split-1');

			expect(result).toBeUndefined();
		});
	});

	describe('Error Cases', () => {
		it('should throw NotFoundError when like does not exist', async () => {
			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(null);

			await expect(useCase.execute('user-1', 'split-1')).rejects.toThrow(NotFoundError);

			expect(likeRepository.deleteByUserIdAndSplitId).not.toHaveBeenCalled();
		});

		it('should include user and split ID in error message', async () => {
			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(null);

			try {
				await useCase.execute('user-123', 'split-456');
				expect.fail('Should have thrown NotFoundError');
			} catch (error) {
				expect(error).toBeInstanceOf(NotFoundError);
				expect((error as NotFoundError).message).toContain('user:user-123-split:split-456');
			}
		});

		it('should not call delete when like is not found', async () => {
			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(null);

			try {
				await useCase.execute('user-1', 'split-1');
			} catch {
				// Expected error
			}

			expect(likeRepository.deleteByUserIdAndSplitId).not.toHaveBeenCalled();
		});
	});

	describe('Different Users and Splits', () => {
		it('should handle different user IDs', async () => {
			const mockLike = new Like('like-2', 'user-999', 'split-1', new Date());

			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(mockLike);
			vi.mocked(likeRepository.deleteByUserIdAndSplitId).mockResolvedValue();

			await useCase.execute('user-999', 'split-1');

			expect(likeRepository.findByUserIdAndSplitId).toHaveBeenCalledWith('user-999', 'split-1');
			expect(likeRepository.deleteByUserIdAndSplitId).toHaveBeenCalledWith('user-999', 'split-1');
		});

		it('should handle different split IDs', async () => {
			const mockLike = new Like('like-3', 'user-1', 'split-999', new Date());

			vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(mockLike);
			vi.mocked(likeRepository.deleteByUserIdAndSplitId).mockResolvedValue();

			await useCase.execute('user-1', 'split-999');

			expect(likeRepository.findByUserIdAndSplitId).toHaveBeenCalledWith('user-1', 'split-999');
			expect(likeRepository.deleteByUserIdAndSplitId).toHaveBeenCalledWith('user-1', 'split-999');
		});
	});
});
