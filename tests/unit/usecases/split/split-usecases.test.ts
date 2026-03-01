import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteSplitUseCase } from '../../../../src/core/usecases/split/delete-split.usecase';
import { UpdateSplitUseCase } from '../../../../src/core/usecases/split/update-split.usecase';
import { UnlikeSplitUseCase } from '../../../../src/core/usecases/split/unlike-split.usecase';
import { DeleteCommentUseCase } from '../../../../src/core/usecases/split/delete-comment.usecase';
import { UpdateCommentUseCase } from '../../../../src/core/usecases/split/update-comment.usecase';
import { DeleteReviewUseCase } from '../../../../src/core/usecases/split/delete-review.usecase';
import { UpdateReviewUseCase } from '../../../../src/core/usecases/split/update-review.usecase';
import { CheckReviewEligibilityUseCase } from '../../../../src/core/usecases/split/check-review-eligibility.usecase';
import { GetReviewsUseCase } from '../../../../src/core/usecases/split/get-reviews.usecase';
import { SearchSplitsUseCase } from '../../../../src/core/usecases/split/search-splits.usecase';
import { GetSplitUseCase } from '../../../../src/core/usecases/split/get-split.usecase';
import { GetUserSplitsUseCase } from '../../../../src/core/usecases/split/get-user-splits.usecase';
import { GetUserSplitsWithDaysUseCase } from '../../../../src/core/usecases/split/get-user-splits-with-days.usecase';
import { CountSplitsUseCase } from '../../../../src/core/usecases/split/count-splits.usecase';
import { GetSplitLikesUseCase } from '../../../../src/core/usecases/split/get-split-likes.usecase';
import { GetSplitCommentsUseCase } from '../../../../src/core/usecases/split/get-split-comments.usecase';
import { HasUserLikedSplitUseCase } from '../../../../src/core/usecases/split/has-user-liked-split.usecase';
import { GetUserSplitReviewUseCase } from '../../../../src/core/usecases/split/get-user-split-review.usecase';
import { Split } from '../../../../src/core/domain/split/split.entity';
import { Like } from '../../../../src/core/domain/split/like.entity';
import { Comment } from '../../../../src/core/domain/split/comment.entity';
import { Review } from '../../../../src/core/domain/split/review.entity';
import type { ISplitRepository } from '../../../../src/core/ports/repositories/split.repository.port';
import type { ILikeRepository } from '../../../../src/core/ports/repositories/like.repository.port';
import type { ICommentRepository } from '../../../../src/core/ports/repositories/comment.repository.port';
import type { IReviewRepository } from '../../../../src/core/ports/repositories/review.repository.port';
import type { IWorkoutLogRepository } from '../../../../src/core/ports/repositories/workout-log.repository.port';

function createMockSplitRepository(): ISplitRepository {
	return {
		findById: vi.fn(),
		findByIdWithDetails: vi.fn(),
		findByUserId: vi.fn(),
		findByUserIdWithDays: vi.fn(),
		findWithFilters: vi.fn(),
		countWithFilters: vi.fn(),
		createWithDays: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		exists: vi.fn(),
		isOwnedByUser: vi.fn()
	};
}

function createMockLikeRepository(): ILikeRepository {
	return {
		findById: vi.fn(),
		findByUserIdAndSplitId: vi.fn(),
		findBySplitId: vi.fn(),
		countBySplitId: vi.fn(),
		create: vi.fn(),
		delete: vi.fn(),
		deleteByUserIdAndSplitId: vi.fn(),
		hasUserLiked: vi.fn()
	};
}

function createMockCommentRepository(): ICommentRepository {
	return {
		findById: vi.fn(),
		findByIdWithUser: vi.fn(),
		findBySplitId: vi.fn(),
		countBySplitId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		isOwnedByUser: vi.fn()
	};
}

function createMockReviewRepository(): IReviewRepository {
	return {
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
}

const now = new Date();
const mockReview = new Review('rev-1', 'user-1', 'split-1', 4, 'Great split', now, now);

describe('DeleteSplitUseCase', () => {
	let repo: ISplitRepository;
	let useCase: DeleteSplitUseCase;

	beforeEach(() => {
		repo = createMockSplitRepository();
		useCase = new DeleteSplitUseCase(repo);
	});

	it('should delete a split owned by the user', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);

		await useCase.execute('split-1', 'user-1');

		expect(repo.delete).toHaveBeenCalledWith('split-1');
	});

	it('should throw NotFoundError if split does not exist', async () => {
		vi.mocked(repo.exists).mockResolvedValue(false);

		await expect(useCase.execute('split-1', 'user-1')).rejects.toThrow(
			"Split with id 'split-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the split', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('split-1', 'user-2')).rejects.toThrow(
			'Not authorized to delete this split'
		);
	});
});

describe('UpdateSplitUseCase', () => {
	let repo: ISplitRepository;
	let useCase: UpdateSplitUseCase;

	beforeEach(() => {
		repo = createMockSplitRepository();
		useCase = new UpdateSplitUseCase(repo);
	});

	it('should update a split owned by the user', async () => {
		const updated = new Split(
			'split-1',
			'user-1',
			'Updated',
			null,
			true,
			false,
			'beginner',
			null,
			null,
			null,
			now,
			now
		);
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);
		vi.mocked(repo.update).mockResolvedValue(updated);

		const result = await useCase.execute('split-1', 'user-1', { title: 'Updated' });

		expect(repo.update).toHaveBeenCalledWith('split-1', { title: 'Updated' });
		expect(result.title).toBe('Updated');
	});

	it('should throw NotFoundError if split does not exist', async () => {
		vi.mocked(repo.exists).mockResolvedValue(false);

		await expect(useCase.execute('split-1', 'user-1', { title: 'X' })).rejects.toThrow(
			"Split with id 'split-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the split', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('split-1', 'user-2', { title: 'X' })).rejects.toThrow(
			'Not authorized to update this split'
		);
	});
});

describe('UnlikeSplitUseCase', () => {
	let repo: ILikeRepository;
	let useCase: UnlikeSplitUseCase;

	beforeEach(() => {
		repo = createMockLikeRepository();
		useCase = new UnlikeSplitUseCase(repo);
	});

	it('should unlike a split that was previously liked', async () => {
		const existingLike = new Like('like-1', 'user-1', 'split-1', now);
		vi.mocked(repo.findByUserIdAndSplitId).mockResolvedValue(existingLike);

		await useCase.execute('user-1', 'split-1');

		expect(repo.deleteByUserIdAndSplitId).toHaveBeenCalledWith('user-1', 'split-1');
	});

	it('should throw NotFoundError if like does not exist', async () => {
		vi.mocked(repo.findByUserIdAndSplitId).mockResolvedValue(undefined);

		await expect(useCase.execute('user-1', 'split-1')).rejects.toThrow(
			"Like with id 'user:user-1-split:split-1' not found"
		);
	});
});

describe('DeleteCommentUseCase', () => {
	let repo: ICommentRepository;
	let useCase: DeleteCommentUseCase;

	beforeEach(() => {
		repo = createMockCommentRepository();
		useCase = new DeleteCommentUseCase(repo);
	});

	it('should delete a comment owned by the user', async () => {
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);

		await useCase.execute('comment-1', 'user-1');

		expect(repo.delete).toHaveBeenCalledWith('comment-1');
	});

	it('should throw ForbiddenError if user does not own the comment', async () => {
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('comment-1', 'user-2')).rejects.toThrow(
			'Not authorized to delete this comment'
		);
	});
});

describe('UpdateCommentUseCase', () => {
	let repo: ICommentRepository;
	let useCase: UpdateCommentUseCase;

	beforeEach(() => {
		repo = createMockCommentRepository();
		useCase = new UpdateCommentUseCase(repo);
	});

	it('should update a comment owned by the user', async () => {
		const updated = new Comment('comment-1', 'user-1', 'split-1', 'Updated content', now, now);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);
		vi.mocked(repo.update).mockResolvedValue(updated);

		const result = await useCase.execute('comment-1', 'user-1', { content: 'Updated content' });

		expect(repo.update).toHaveBeenCalledWith('comment-1', { content: 'Updated content' });
		expect(result.content).toBe('Updated content');
	});

	it('should throw ForbiddenError if user does not own the comment', async () => {
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('comment-1', 'user-2', { content: 'X' })).rejects.toThrow(
			'Not authorized to update this comment'
		);
	});
});

describe('DeleteReviewUseCase', () => {
	let repo: IReviewRepository;
	let useCase: DeleteReviewUseCase;

	beforeEach(() => {
		repo = createMockReviewRepository();
		useCase = new DeleteReviewUseCase(repo);
	});

	it('should delete a review owned by the user', async () => {
		vi.mocked(repo.findById).mockResolvedValue(mockReview);

		await useCase.execute('rev-1', 'user-1');

		expect(repo.delete).toHaveBeenCalledWith('rev-1');
	});

	it('should throw NotFoundError if review does not exist', async () => {
		vi.mocked(repo.findById).mockResolvedValue(undefined);

		await expect(useCase.execute('rev-1', 'user-1')).rejects.toThrow(
			"Review with id 'rev-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the review', async () => {
		vi.mocked(repo.findById).mockResolvedValue(mockReview);

		await expect(useCase.execute('rev-1', 'user-2')).rejects.toThrow(
			'Not authorized to delete this review'
		);
	});
});

describe('UpdateReviewUseCase', () => {
	let repo: IReviewRepository;
	let useCase: UpdateReviewUseCase;

	beforeEach(() => {
		repo = createMockReviewRepository();
		useCase = new UpdateReviewUseCase(repo);
	});

	it('should update a review owned by the user', async () => {
		const updated = new Review('rev-1', 'user-1', 'split-1', 5, 'Even better', now, now);
		vi.mocked(repo.findById).mockResolvedValue(mockReview);
		vi.mocked(repo.update).mockResolvedValue(updated);

		const result = await useCase.execute('rev-1', 'user-1', { rating: 5, content: 'Even better' });

		expect(repo.update).toHaveBeenCalledWith('rev-1', { rating: 5, content: 'Even better' });
		expect(result.rating).toBe(5);
	});

	it('should throw NotFoundError if review does not exist', async () => {
		vi.mocked(repo.findById).mockResolvedValue(undefined);

		await expect(useCase.execute('rev-1', 'user-1', { rating: 5, content: 'X' })).rejects.toThrow(
			"Review with id 'rev-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the review', async () => {
		vi.mocked(repo.findById).mockResolvedValue(mockReview);

		await expect(useCase.execute('rev-1', 'user-2', { rating: 5, content: 'X' })).rejects.toThrow(
			'Not authorized to update this review'
		);
	});
});

describe('CheckReviewEligibilityUseCase', () => {
	it('should return true if user has completed a workout for the split', async () => {
		const workoutLogRepo = {
			hasCompletedWorkoutForSplit: vi.fn()
		} as unknown as IWorkoutLogRepository;
		vi.mocked(workoutLogRepo.hasCompletedWorkoutForSplit).mockResolvedValue(true);

		const useCase = new CheckReviewEligibilityUseCase(workoutLogRepo);
		const result = await useCase.execute('user-1', 'split-1');

		expect(result).toBe(true);
		expect(workoutLogRepo.hasCompletedWorkoutForSplit).toHaveBeenCalledWith('user-1', 'split-1');
	});

	it('should return false if user has not completed a workout', async () => {
		const workoutLogRepo = {
			hasCompletedWorkoutForSplit: vi.fn()
		} as unknown as IWorkoutLogRepository;
		vi.mocked(workoutLogRepo.hasCompletedWorkoutForSplit).mockResolvedValue(false);

		const useCase = new CheckReviewEligibilityUseCase(workoutLogRepo);
		const result = await useCase.execute('user-1', 'split-1');

		expect(result).toBe(false);
	});

	it('assertEligible should throw BusinessRuleError if not eligible', async () => {
		const workoutLogRepo = {
			hasCompletedWorkoutForSplit: vi.fn()
		} as unknown as IWorkoutLogRepository;
		vi.mocked(workoutLogRepo.hasCompletedWorkoutForSplit).mockResolvedValue(false);

		const useCase = new CheckReviewEligibilityUseCase(workoutLogRepo);

		await expect(useCase.assertEligible('user-1', 'split-1')).rejects.toThrow(
			'You must complete at least one workout using this split before you can review it'
		);
	});
});

describe('GetReviewsUseCase', () => {
	it('should return reviews and stats in parallel', async () => {
		const repo = createMockReviewRepository();
		const mockReviews = [
			{
				id: 'rev-1',
				rating: 4,
				content: 'Great',
				user: { id: 'user-1', name: 'Test', image: null },
				createdAt: now,
				updatedAt: now
			}
		];
		const mockStats = {
			averageRating: 4,
			totalReviews: 1,
			ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 }
		};
		vi.mocked(repo.findBySplitId).mockResolvedValue(mockReviews as never);
		vi.mocked(repo.getReviewStats).mockResolvedValue(mockStats);

		const useCase = new GetReviewsUseCase(repo);
		const result = await useCase.execute('split-1');

		expect(result.reviews).toEqual(mockReviews);
		expect(result.stats).toEqual(mockStats);
		expect(repo.findBySplitId).toHaveBeenCalledWith('split-1');
		expect(repo.getReviewStats).toHaveBeenCalledWith('split-1');
	});
});

describe('SearchSplitsUseCase', () => {
	it('should delegate to findWithFilters', async () => {
		const repo = createMockSplitRepository();
		vi.mocked(repo.findWithFilters).mockResolvedValue([]);

		const useCase = new SearchSplitsUseCase(repo);
		const filters = { isPublic: true, difficulty: 'beginner' as const };
		const pagination = { limit: 10, offset: 0 };
		const result = await useCase.execute(filters, pagination, 'user-1');

		expect(result).toEqual([]);
		expect(repo.findWithFilters).toHaveBeenCalledWith(filters, pagination, 'user-1');
	});
});

describe('GetSplitUseCase', () => {
	it('should delegate to findByIdWithDetails', async () => {
		const repo = createMockSplitRepository();
		vi.mocked(repo.findByIdWithDetails).mockResolvedValue(undefined);

		const useCase = new GetSplitUseCase(repo);
		const result = await useCase.execute('split-1', 'user-1');

		expect(result).toBeUndefined();
		expect(repo.findByIdWithDetails).toHaveBeenCalledWith('split-1', 'user-1');
	});
});

describe('GetUserSplitsUseCase', () => {
	it('should delegate to findByUserId', async () => {
		const repo = createMockSplitRepository();
		vi.mocked(repo.findByUserId).mockResolvedValue([]);

		const useCase = new GetUserSplitsUseCase(repo);
		const result = await useCase.execute('user-1');

		expect(result).toEqual([]);
		expect(repo.findByUserId).toHaveBeenCalledWith('user-1');
	});
});

describe('GetUserSplitsWithDaysUseCase', () => {
	it('should delegate to findByUserIdWithDays', async () => {
		const repo = createMockSplitRepository();
		vi.mocked(repo.findByUserIdWithDays).mockResolvedValue([]);

		const useCase = new GetUserSplitsWithDaysUseCase(repo);
		const result = await useCase.execute('user-1');

		expect(result).toEqual([]);
		expect(repo.findByUserIdWithDays).toHaveBeenCalledWith('user-1');
	});
});

describe('CountSplitsUseCase', () => {
	it('should delegate to countWithFilters', async () => {
		const repo = createMockSplitRepository();
		vi.mocked(repo.countWithFilters).mockResolvedValue(42);

		const useCase = new CountSplitsUseCase(repo);
		const result = await useCase.execute({ isPublic: true });

		expect(result).toBe(42);
		expect(repo.countWithFilters).toHaveBeenCalledWith({ isPublic: true });
	});
});

describe('GetSplitLikesUseCase', () => {
	it('should delegate to findBySplitId', async () => {
		const repo = createMockLikeRepository();
		vi.mocked(repo.findBySplitId).mockResolvedValue([]);

		const useCase = new GetSplitLikesUseCase(repo);
		const result = await useCase.execute('split-1');

		expect(result).toEqual([]);
		expect(repo.findBySplitId).toHaveBeenCalledWith('split-1');
	});
});

describe('GetSplitCommentsUseCase', () => {
	it('should delegate to findBySplitId', async () => {
		const repo = createMockCommentRepository();
		vi.mocked(repo.findBySplitId).mockResolvedValue([]);

		const useCase = new GetSplitCommentsUseCase(repo);
		const result = await useCase.execute('split-1');

		expect(result).toEqual([]);
		expect(repo.findBySplitId).toHaveBeenCalledWith('split-1');
	});
});

describe('HasUserLikedSplitUseCase', () => {
	it('should delegate to hasUserLiked', async () => {
		const repo = createMockLikeRepository();
		vi.mocked(repo.hasUserLiked).mockResolvedValue(true);

		const useCase = new HasUserLikedSplitUseCase(repo);
		const result = await useCase.execute('user-1', 'split-1');

		expect(result).toBe(true);
		expect(repo.hasUserLiked).toHaveBeenCalledWith('user-1', 'split-1');
	});
});

describe('GetUserSplitReviewUseCase', () => {
	it('should delegate to findByUserAndSplit', async () => {
		const repo = createMockReviewRepository();
		vi.mocked(repo.findByUserAndSplit).mockResolvedValue(mockReview);

		const useCase = new GetUserSplitReviewUseCase(repo);
		const result = await useCase.execute('user-1', 'split-1');

		expect(result).toEqual(mockReview);
		expect(repo.findByUserAndSplit).toHaveBeenCalledWith('user-1', 'split-1');
	});
});
