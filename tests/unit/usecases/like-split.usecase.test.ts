import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LikeSplitUseCase } from '../../../src/core/usecases/split/like-split.usecase';
import { Like } from '../../../src/core/domain/split/like.entity';
import { Split } from '../../../src/core/domain/split/split.entity';
import type { ILikeRepository } from '../../../src/core/ports/repositories/like.repository.port';
import type { ISplitRepository } from '../../../src/core/ports/repositories/split.repository.port';

describe('LikeSplitUseCase', () => {
	let likeRepository: ILikeRepository;
	let splitRepository: ISplitRepository;
	let useCase: LikeSplitUseCase;

	beforeEach(() => {
		likeRepository = {
			findById: vi.fn(),
			findByUserIdAndSplitId: vi.fn(),
			findBySplitId: vi.fn(),
			countBySplitId: vi.fn(),
			create: vi.fn(),
			delete: vi.fn(),
			deleteByUserIdAndSplitId: vi.fn(),
			hasUserLiked: vi.fn()
		};

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

		useCase = new LikeSplitUseCase(likeRepository, splitRepository);
	});

	it('should like a split successfully', async () => {
		const mockSplit = new Split(
			'split-1',
			'user-2',
			'Test Split',
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
		const mockLike = new Like('like-1', 'user-1', 'split-1', new Date());

		vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
		vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(undefined);
		vi.mocked(likeRepository.create).mockResolvedValue(mockLike);

		const result = await useCase.execute({
			userId: 'user-1',
			splitId: 'split-1'
		});

		expect(result).toEqual(mockLike);
		expect(splitRepository.findById).toHaveBeenCalledWith('split-1');
		expect(likeRepository.findByUserIdAndSplitId).toHaveBeenCalledWith('user-1', 'split-1');
		expect(likeRepository.create).toHaveBeenCalledWith({
			userId: 'user-1',
			splitId: 'split-1'
		});
	});

	it('should throw error if split not found', async () => {
		vi.mocked(splitRepository.findById).mockResolvedValue(undefined);

		await expect(
			useCase.execute({
				userId: 'user-1',
				splitId: 'split-1'
			})
		).rejects.toThrow('Split not found');
	});

	it('should throw error if already liked', async () => {
		const mockSplit = new Split(
			'split-1',
			'user-2',
			'Test Split',
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
		const existingLike = new Like('like-1', 'user-1', 'split-1', new Date());

		vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
		vi.mocked(likeRepository.findByUserIdAndSplitId).mockResolvedValue(existingLike);

		await expect(
			useCase.execute({
				userId: 'user-1',
				splitId: 'split-1'
			})
		).rejects.toThrow('Split already liked');
	});

	it('should throw error for invalid userId', async () => {
		await expect(
			useCase.execute({
				userId: '',
				splitId: 'split-1'
			})
		).rejects.toThrow('User ID is required');
	});

	it('should throw error for invalid splitId', async () => {
		await expect(
			useCase.execute({
				userId: 'user-1',
				splitId: ''
			})
		).rejects.toThrow('Split ID is required');
	});
});
