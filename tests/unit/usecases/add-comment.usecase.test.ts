import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddCommentUseCase } from '../../../src/core/usecases/split/add-comment.usecase';
import { Comment } from '../../../src/core/domain/split/comment.entity';
import { Split } from '../../../src/core/domain/split/split.entity';
import type { ICommentRepository } from '../../../src/core/ports/repositories/comment.repository.port';
import type { ISplitRepository } from '../../../src/core/ports/repositories/split.repository.port';

describe('AddCommentUseCase', () => {
	let commentRepository: ICommentRepository;
	let splitRepository: ISplitRepository;
	let useCase: AddCommentUseCase;

	beforeEach(() => {
		commentRepository = {
			findById: vi.fn(),
			findByIdWithUser: vi.fn(),
			findBySplitId: vi.fn(),
			countBySplitId: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			isOwnedByUser: vi.fn()
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

		useCase = new AddCommentUseCase(commentRepository, splitRepository);
	});

	it('should add comment successfully', async () => {
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
		const mockComment = new Comment(
			'comment-1',
			'user-1',
			'split-1',
			'Great split!',
			new Date(),
			new Date()
		);

		vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
		vi.mocked(commentRepository.create).mockResolvedValue(mockComment);

		const result = await useCase.execute({
			userId: 'user-1',
			splitId: 'split-1',
			content: 'Great split!'
		});

		expect(result).toEqual(mockComment);
		expect(splitRepository.findById).toHaveBeenCalledWith('split-1');
		expect(commentRepository.create).toHaveBeenCalledWith({
			userId: 'user-1',
			splitId: 'split-1',
			content: 'Great split!'
		});
	});

	it('should throw NotFoundError if split not found', async () => {
		vi.mocked(splitRepository.findById).mockResolvedValue(undefined);

		await expect(
			useCase.execute({
				userId: 'user-1',
				splitId: 'split-1',
				content: 'Great split!'
			})
		).rejects.toThrow("Split with id 'split-1' not found");
	});
});
