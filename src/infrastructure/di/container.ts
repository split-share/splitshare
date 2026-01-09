import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { logger } from '$lib/server/logger';
import type { ILoggerService } from '$core/ports/logger/logger.port';

// Adapters
import { DrizzleSplitRepositoryAdapter } from '../../adapters/repositories/drizzle/split.repository.adapter';
import { DrizzleExerciseRepositoryAdapter } from '../../adapters/repositories/drizzle/exercise.repository.adapter';
import { DrizzleUserRepositoryAdapter } from '../../adapters/repositories/drizzle/user.repository.adapter';
import { DrizzleWorkoutLogRepositoryAdapter } from '../../adapters/repositories/drizzle/workout-log.repository.adapter';
import { DrizzlePersonalRecordRepositoryAdapter } from '../../adapters/repositories/drizzle/personal-record.repository.adapter';
import { DrizzleLikeRepositoryAdapter } from '../../adapters/repositories/drizzle/like.repository.adapter';
import { DrizzleCommentRepositoryAdapter } from '../../adapters/repositories/drizzle/comment.repository.adapter';
import { DrizzleReviewRepositoryAdapter } from '../../adapters/repositories/drizzle/review.repository.adapter';
import { DrizzleWeightEntryRepositoryAdapter } from '../../adapters/repositories/drizzle/weight-entry.repository.adapter';
import { DrizzleWorkoutSessionRepositoryAdapter } from '../../adapters/repositories/drizzle/workout-session.repository.adapter';
import { DrizzleForumRepositoryAdapter } from '../../adapters/repositories/drizzle/forum.repository.adapter';
import { BetterAuthAdapter } from '../../adapters/auth/better-auth/auth.adapter';

// Use cases
import { CreateSplitUseCase } from '../../core/usecases/split/create-split.usecase';
import { UpdateSplitUseCase } from '../../core/usecases/split/update-split.usecase';
import { DeleteSplitUseCase } from '../../core/usecases/split/delete-split.usecase';
import { GetSplitUseCase } from '../../core/usecases/split/get-split.usecase';
import { SearchSplitsUseCase } from '../../core/usecases/split/search-splits.usecase';

import { CreateExerciseUseCase } from '../../core/usecases/exercise/create-exercise.usecase';
import { UpdateExerciseUseCase } from '../../core/usecases/exercise/update-exercise.usecase';
import { DeleteExerciseUseCase } from '../../core/usecases/exercise/delete-exercise.usecase';
import { SearchExercisesUseCase } from '../../core/usecases/exercise/search-exercises.usecase';

import { LogWorkoutUseCase } from '../../core/usecases/workout/log-workout.usecase';
import { GetWorkoutHistoryUseCase } from '../../core/usecases/workout/get-workout-history.usecase';
import { GetUserStatsUseCase } from '../../core/usecases/workout/get-user-stats.usecase';
import { GetPersonalRecordsUseCase } from '../../core/usecases/workout/get-personal-records.usecase';

import { LikeSplitUseCase } from '../../core/usecases/split/like-split.usecase';
import { UnlikeSplitUseCase } from '../../core/usecases/split/unlike-split.usecase';
import { AddCommentUseCase } from '../../core/usecases/split/add-comment.usecase';
import { UpdateCommentUseCase } from '../../core/usecases/split/update-comment.usecase';
import { DeleteCommentUseCase } from '../../core/usecases/split/delete-comment.usecase';
import { CreateReviewUseCase } from '../../core/usecases/split/create-review.usecase';
import { UpdateReviewUseCase } from '../../core/usecases/split/update-review.usecase';
import { DeleteReviewUseCase } from '../../core/usecases/split/delete-review.usecase';
import { GetReviewsUseCase } from '../../core/usecases/split/get-reviews.usecase';
import { CheckReviewEligibilityUseCase } from '../../core/usecases/split/check-review-eligibility.usecase';

import { CreateWeightEntryUseCase } from '../../core/usecases/weight/create-weight-entry.usecase';
import { GetWeightHistoryUseCase } from '../../core/usecases/weight/get-weight-history.usecase';
import { GetWeightStatsUseCase } from '../../core/usecases/weight/get-weight-stats.usecase';
import { GetWeightChartDataUseCase } from '../../core/usecases/weight/get-weight-chart-data.usecase';
import { DeleteWeightEntryUseCase } from '../../core/usecases/weight/delete-weight-entry.usecase';

import { StartWorkoutSessionUseCase } from '../../core/usecases/workout/start-workout-session.usecase';
import { GetActiveWorkoutSessionUseCase } from '../../core/usecases/workout/get-active-workout-session.usecase';
import { UpdateWorkoutSessionUseCase } from '../../core/usecases/workout/update-workout-session.usecase';
import { CompleteSetUseCase } from '../../core/usecases/workout/complete-set.usecase';
import { CompleteWorkoutSessionUseCase } from '../../core/usecases/workout/complete-workout-session.usecase';
import { AbandonWorkoutSessionUseCase } from '../../core/usecases/workout/abandon-workout-session.usecase';
import { GetProgressionSuggestionsUseCase } from '../../core/usecases/workout/get-progression-suggestions.usecase';
import { GetMuscleHeatmapUseCase } from '../../core/usecases/workout/get-muscle-heatmap.usecase';

import { GetCategoriesUseCase } from '../../core/usecases/forum/get-categories.usecase';
import { GetTopicsUseCase } from '../../core/usecases/forum/get-topics.usecase';
import { GetTopicUseCase } from '../../core/usecases/forum/get-topic.usecase';
import { CreateTopicUseCase } from '../../core/usecases/forum/create-topic.usecase';
import { UpdateTopicUseCase } from '../../core/usecases/forum/update-topic.usecase';
import { DeleteTopicUseCase } from '../../core/usecases/forum/delete-topic.usecase';
import { GetPostsUseCase } from '../../core/usecases/forum/get-posts.usecase';
import { CreatePostUseCase } from '../../core/usecases/forum/create-post.usecase';
import { UpdatePostUseCase } from '../../core/usecases/forum/update-post.usecase';
import { DeletePostUseCase } from '../../core/usecases/forum/delete-post.usecase';

/**
 * Dependency Injection Container
 *
 * This is where we wire up all dependencies.
 * To swap implementations, just change the adapters here.
 */
class Container {
	// Repositories (adapters)
	private _splitRepository?: DrizzleSplitRepositoryAdapter;
	private _exerciseRepository?: DrizzleExerciseRepositoryAdapter;
	private _userRepository?: DrizzleUserRepositoryAdapter;
	private _workoutLogRepository?: DrizzleWorkoutLogRepositoryAdapter;
	private _personalRecordRepository?: DrizzlePersonalRecordRepositoryAdapter;
	private _likeRepository?: DrizzleLikeRepositoryAdapter;
	private _commentRepository?: DrizzleCommentRepositoryAdapter;
	private _reviewRepository?: DrizzleReviewRepositoryAdapter;
	private _weightEntryRepository?: DrizzleWeightEntryRepositoryAdapter;
	private _workoutSessionRepository?: DrizzleWorkoutSessionRepositoryAdapter;
	private _forumRepository?: DrizzleForumRepositoryAdapter;

	// Services (adapters)
	private _authService?: BetterAuthAdapter;

	// Review use cases (cached)
	private _checkReviewEligibility?: CheckReviewEligibilityUseCase;
	private _createReview?: CreateReviewUseCase;
	private _updateReview?: UpdateReviewUseCase;
	private _deleteReview?: DeleteReviewUseCase;
	private _getReviews?: GetReviewsUseCase;

	// Lazy initialization for repositories
	get splitRepository(): DrizzleSplitRepositoryAdapter {
		if (!this._splitRepository) {
			this._splitRepository = new DrizzleSplitRepositoryAdapter(db);
		}
		return this._splitRepository;
	}

	get exerciseRepository(): DrizzleExerciseRepositoryAdapter {
		if (!this._exerciseRepository) {
			this._exerciseRepository = new DrizzleExerciseRepositoryAdapter(db);
		}
		return this._exerciseRepository;
	}

	get userRepository(): DrizzleUserRepositoryAdapter {
		if (!this._userRepository) {
			this._userRepository = new DrizzleUserRepositoryAdapter(db);
		}
		return this._userRepository;
	}

	get workoutLogRepository(): DrizzleWorkoutLogRepositoryAdapter {
		if (!this._workoutLogRepository) {
			this._workoutLogRepository = new DrizzleWorkoutLogRepositoryAdapter(db);
		}
		return this._workoutLogRepository;
	}

	get personalRecordRepository(): DrizzlePersonalRecordRepositoryAdapter {
		if (!this._personalRecordRepository) {
			this._personalRecordRepository = new DrizzlePersonalRecordRepositoryAdapter(db);
		}
		return this._personalRecordRepository;
	}

	get likeRepository(): DrizzleLikeRepositoryAdapter {
		if (!this._likeRepository) {
			this._likeRepository = new DrizzleLikeRepositoryAdapter(db);
		}
		return this._likeRepository;
	}

	get commentRepository(): DrizzleCommentRepositoryAdapter {
		if (!this._commentRepository) {
			this._commentRepository = new DrizzleCommentRepositoryAdapter(db);
		}
		return this._commentRepository;
	}

	get reviewRepository(): DrizzleReviewRepositoryAdapter {
		if (!this._reviewRepository) {
			this._reviewRepository = new DrizzleReviewRepositoryAdapter(db);
		}
		return this._reviewRepository;
	}

	get weightEntryRepository(): DrizzleWeightEntryRepositoryAdapter {
		if (!this._weightEntryRepository) {
			this._weightEntryRepository = new DrizzleWeightEntryRepositoryAdapter(db);
		}
		return this._weightEntryRepository;
	}

	get workoutSessionRepository(): DrizzleWorkoutSessionRepositoryAdapter {
		if (!this._workoutSessionRepository) {
			this._workoutSessionRepository = new DrizzleWorkoutSessionRepositoryAdapter(db);
		}
		return this._workoutSessionRepository;
	}

	get forumRepository(): DrizzleForumRepositoryAdapter {
		if (!this._forumRepository) {
			this._forumRepository = new DrizzleForumRepositoryAdapter(db);
		}
		return this._forumRepository;
	}

	get authService(): BetterAuthAdapter {
		if (!this._authService) {
			this._authService = new BetterAuthAdapter(auth);
		}
		return this._authService;
	}

	get logger(): ILoggerService {
		return logger;
	}

	// Use cases
	get createSplit(): CreateSplitUseCase {
		return new CreateSplitUseCase(this.splitRepository);
	}

	get updateSplit(): UpdateSplitUseCase {
		return new UpdateSplitUseCase(this.splitRepository);
	}

	get deleteSplit(): DeleteSplitUseCase {
		return new DeleteSplitUseCase(this.splitRepository);
	}

	get getSplit(): GetSplitUseCase {
		return new GetSplitUseCase(this.splitRepository);
	}

	get searchSplits(): SearchSplitsUseCase {
		return new SearchSplitsUseCase(this.splitRepository);
	}

	get createExercise(): CreateExerciseUseCase {
		return new CreateExerciseUseCase(this.exerciseRepository);
	}

	get updateExercise(): UpdateExerciseUseCase {
		return new UpdateExerciseUseCase(this.exerciseRepository);
	}

	get searchExercises(): SearchExercisesUseCase {
		return new SearchExercisesUseCase(this.exerciseRepository);
	}

	get deleteExercise(): DeleteExerciseUseCase {
		return new DeleteExerciseUseCase(this.exerciseRepository);
	}

	get logWorkout(): LogWorkoutUseCase {
		return new LogWorkoutUseCase(this.workoutLogRepository, this.personalRecordRepository);
	}

	get getWorkoutHistory(): GetWorkoutHistoryUseCase {
		return new GetWorkoutHistoryUseCase(this.workoutLogRepository);
	}

	get getUserStats(): GetUserStatsUseCase {
		return new GetUserStatsUseCase(this.workoutLogRepository);
	}

	get getPersonalRecords(): GetPersonalRecordsUseCase {
		return new GetPersonalRecordsUseCase(this.personalRecordRepository);
	}

	get likeSplit(): LikeSplitUseCase {
		return new LikeSplitUseCase(this.likeRepository, this.splitRepository);
	}

	get unlikeSplit(): UnlikeSplitUseCase {
		return new UnlikeSplitUseCase(this.likeRepository);
	}

	get addComment(): AddCommentUseCase {
		return new AddCommentUseCase(this.commentRepository, this.splitRepository);
	}

	get updateComment(): UpdateCommentUseCase {
		return new UpdateCommentUseCase(this.commentRepository);
	}

	get deleteComment(): DeleteCommentUseCase {
		return new DeleteCommentUseCase(this.commentRepository);
	}

	// Review use cases
	get checkReviewEligibility(): CheckReviewEligibilityUseCase {
		if (!this._checkReviewEligibility) {
			this._checkReviewEligibility = new CheckReviewEligibilityUseCase(this.workoutLogRepository);
		}
		return this._checkReviewEligibility;
	}

	get createReview(): CreateReviewUseCase {
		if (!this._createReview) {
			this._createReview = new CreateReviewUseCase(
				this.reviewRepository,
				this.splitRepository,
				this.checkReviewEligibility
			);
		}
		return this._createReview;
	}

	get updateReview(): UpdateReviewUseCase {
		if (!this._updateReview) {
			this._updateReview = new UpdateReviewUseCase(this.reviewRepository);
		}
		return this._updateReview;
	}

	get deleteReview(): DeleteReviewUseCase {
		if (!this._deleteReview) {
			this._deleteReview = new DeleteReviewUseCase(this.reviewRepository);
		}
		return this._deleteReview;
	}

	get getReviews(): GetReviewsUseCase {
		if (!this._getReviews) {
			this._getReviews = new GetReviewsUseCase(this.reviewRepository);
		}
		return this._getReviews;
	}

	get createWeightEntry(): CreateWeightEntryUseCase {
		return new CreateWeightEntryUseCase(this.weightEntryRepository);
	}

	get getWeightHistory(): GetWeightHistoryUseCase {
		return new GetWeightHistoryUseCase(this.weightEntryRepository);
	}

	get getWeightStats(): GetWeightStatsUseCase {
		return new GetWeightStatsUseCase(this.weightEntryRepository);
	}

	get getWeightChartData(): GetWeightChartDataUseCase {
		return new GetWeightChartDataUseCase(this.weightEntryRepository);
	}

	get deleteWeightEntry(): DeleteWeightEntryUseCase {
		return new DeleteWeightEntryUseCase(this.weightEntryRepository);
	}

	// Workout session use cases
	get startWorkoutSession(): StartWorkoutSessionUseCase {
		return new StartWorkoutSessionUseCase(this.workoutSessionRepository, this.splitRepository);
	}

	get getActiveWorkoutSession(): GetActiveWorkoutSessionUseCase {
		return new GetActiveWorkoutSessionUseCase(this.workoutSessionRepository);
	}

	get updateWorkoutSession(): UpdateWorkoutSessionUseCase {
		return new UpdateWorkoutSessionUseCase(this.workoutSessionRepository);
	}

	get completeSet(): CompleteSetUseCase {
		return new CompleteSetUseCase(this.workoutSessionRepository);
	}

	get completeWorkoutSession(): CompleteWorkoutSessionUseCase {
		return new CompleteWorkoutSessionUseCase(
			this.workoutSessionRepository,
			this.workoutLogRepository,
			this.personalRecordRepository
		);
	}

	get abandonWorkoutSession(): AbandonWorkoutSessionUseCase {
		return new AbandonWorkoutSessionUseCase(this.workoutSessionRepository);
	}

	get getProgressionSuggestions(): GetProgressionSuggestionsUseCase {
		return new GetProgressionSuggestionsUseCase(
			this.workoutLogRepository,
			this.personalRecordRepository,
			this.exerciseRepository
		);
	}

	get getMuscleHeatmap(): GetMuscleHeatmapUseCase {
		return new GetMuscleHeatmapUseCase(this.workoutLogRepository);
	}

	// Forum use cases
	get getCategories(): GetCategoriesUseCase {
		return new GetCategoriesUseCase(this.forumRepository);
	}

	get getTopics(): GetTopicsUseCase {
		return new GetTopicsUseCase(this.forumRepository);
	}

	get getTopic(): GetTopicUseCase {
		return new GetTopicUseCase(this.forumRepository);
	}

	get createTopic(): CreateTopicUseCase {
		return new CreateTopicUseCase(this.forumRepository);
	}

	get updateTopic(): UpdateTopicUseCase {
		return new UpdateTopicUseCase(this.forumRepository);
	}

	get deleteTopic(): DeleteTopicUseCase {
		return new DeleteTopicUseCase(this.forumRepository);
	}

	get getPosts(): GetPostsUseCase {
		return new GetPostsUseCase(this.forumRepository);
	}

	get createPost(): CreatePostUseCase {
		return new CreatePostUseCase(this.forumRepository);
	}

	get updatePost(): UpdatePostUseCase {
		return new UpdatePostUseCase(this.forumRepository);
	}

	get deletePost(): DeletePostUseCase {
		return new DeletePostUseCase(this.forumRepository);
	}
}

/**
 * Global container instance
 */
export const container = new Container();
