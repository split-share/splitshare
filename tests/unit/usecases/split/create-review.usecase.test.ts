import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateReviewUseCase } from '../../../../src/core/usecases/split/create-review.usecase';
import { Review } from '../../../../src/core/domain/split/review.entity';
import { Split } from '../../../../src/core/domain/split/split.entity';
import type { IReviewRepository } from '../../../../src/core/ports/repositories/review.repository.port';
import type { ISplitRepository } from '../../../../src/core/ports/repositories/split.repository.port';
import type { CheckReviewEligibilityUseCase } from '../../../../src/core/usecases/split/check-review-eligibility.usecase';
import {
	NotFoundError,
	AlreadyExistsError,
	BusinessRuleError
} from '../../../../src/core/domain/common/errors';

describe('CreateReviewUseCase', () => {
	let reviewRepository: IReviewRepository;
	let splitRepository: ISplitRepository;
	let checkEligibility: CheckReviewEligibilityUseCase;
	let useCase: CreateReviewUseCase;

	beforeEach(() => {
		reviewRepository = {
			findById: vi.fn(),
			findByIdWithUser: vi.fn(),
			findByUserAndSplit: vi.fn(),
			findBySplitId: vi.fn(),
			getReviewStats: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			isOwnedByUser: vi.fn(),
			hasUserReviewedSplit: vi.fn()
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

		checkEligibility = {
			execute: vi.fn(),
			assertEligible: vi.fn()
		} as unknown as CheckReviewEligibilityUseCase;

		useCase = new CreateReviewUseCase(reviewRepository, splitRepository, checkEligibility);
	});

	describe('Valid Inputs', () => {
		it('should create a review successfully', async () => {
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
			const mockReview = new Review(
				'review-1',
				'user-1',
				'split-1',
				5,
				'Great workout split!',
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
			vi.mocked(reviewRepository.hasUserReviewedSplit).mockResolvedValue(false);
			vi.mocked(reviewRepository.create).mockResolvedValue(mockReview);

			const result = await useCase.execute({
				userId: 'user-1',
				splitId: 'split-1',
				rating: 5,
				content: 'Great workout split!'
			});

			expect(result).toEqual(mockReview);
			expect(splitRepository.findById).toHaveBeenCalledWith('split-1');
			expect(reviewRepository.hasUserReviewedSplit).toHaveBeenCalledWith('user-1', 'split-1');
			expect(checkEligibility.assertEligible).toHaveBeenCalledWith('user-1', 'split-1');
			expect(reviewRepository.create).toHaveBeenCalledWith({
				userId: 'user-1',
				splitId: 'split-1',
				rating: 5,
				content: 'Great workout split!'
			});
		});

		it('should create a review with minimum rating', async () => {
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
			const mockReview = new Review(
				'review-1',
				'user-1',
				'split-1',
				1,
				'Not my favorite',
				new Date(),
				new Date()
			);

			vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
			vi.mocked(reviewRepository.hasUserReviewedSplit).mockResolvedValue(false);
			vi.mocked(reviewRepository.create).mockResolvedValue(mockReview);

			const result = await useCase.execute({
				userId: 'user-1',
				splitId: 'split-1',
				rating: 1,
				content: 'Not my favorite'
			});

			expect(result.rating).toBe(1);
		});

		it('should create a review with empty content string', async () => {
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
			const mockReview = new Review('review-1', 'user-1', 'split-1', 4, '', new Date(), new Date());

			vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
			vi.mocked(reviewRepository.hasUserReviewedSplit).mockResolvedValue(false);
			vi.mocked(reviewRepository.create).mockResolvedValue(mockReview);

			const result = await useCase.execute({
				userId: 'user-1',
				splitId: 'split-1',
				rating: 4,
				content: ''
			});

			expect(result.content).toBe('');
		});
	});

	describe('Error Handling', () => {
		it('should throw NotFoundError if split does not exist', async () => {
			vi.mocked(splitRepository.findById).mockResolvedValue(undefined);

			await expect(
				useCase.execute({
					userId: 'user-1',
					splitId: 'non-existent-split',
					rating: 5,
					content: 'Test review'
				})
			).rejects.toThrow(NotFoundError);

			expect(splitRepository.findById).toHaveBeenCalledWith('non-existent-split');
			expect(reviewRepository.hasUserReviewedSplit).not.toHaveBeenCalled();
			expect(reviewRepository.create).not.toHaveBeenCalled();
		});

		it('should throw AlreadyExistsError if user already reviewed the split', async () => {
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

			vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
			vi.mocked(reviewRepository.hasUserReviewedSplit).mockResolvedValue(true);

			await expect(
				useCase.execute({
					userId: 'user-1',
					splitId: 'split-1',
					rating: 5,
					content: 'Another review'
				})
			).rejects.toThrow(AlreadyExistsError);

			expect(checkEligibility.assertEligible).not.toHaveBeenCalled();
			expect(reviewRepository.create).not.toHaveBeenCalled();
		});

		it('should throw BusinessRuleError if user is not eligible to review', async () => {
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

			vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
			vi.mocked(reviewRepository.hasUserReviewedSplit).mockResolvedValue(false);
			vi.mocked(checkEligibility.assertEligible).mockRejectedValue(
				new BusinessRuleError('You must complete at least one workout to review this split')
			);

			await expect(
				useCase.execute({
					userId: 'user-1',
					splitId: 'split-1',
					rating: 5,
					content: 'Great split!'
				})
			).rejects.toThrow(BusinessRuleError);

			expect(reviewRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle repository errors gracefully', async () => {
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

			vi.mocked(splitRepository.findById).mockResolvedValue(mockSplit);
			vi.mocked(reviewRepository.hasUserReviewedSplit).mockResolvedValue(false);
			vi.mocked(reviewRepository.create).mockRejectedValue(new Error('Database error'));

			await expect(
				useCase.execute({
					userId: 'user-1',
					splitId: 'split-1',
					rating: 5,
					content: 'Test'
				})
			).rejects.toThrow('Database error');
		});
	});
});
