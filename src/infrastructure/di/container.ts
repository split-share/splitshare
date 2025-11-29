import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';

// Adapters
import { DrizzleSplitRepositoryAdapter } from '../../adapters/repositories/drizzle/split.repository.adapter';
import { DrizzleExerciseRepositoryAdapter } from '../../adapters/repositories/drizzle/exercise.repository.adapter';
import { DrizzleUserRepositoryAdapter } from '../../adapters/repositories/drizzle/user.repository.adapter';
import { DrizzleWorkoutLogRepositoryAdapter } from '../../adapters/repositories/drizzle/workout-log.repository.adapter';
import { DrizzlePersonalRecordRepositoryAdapter } from '../../adapters/repositories/drizzle/personal-record.repository.adapter';
import { DrizzleLikeRepositoryAdapter } from '../../adapters/repositories/drizzle/like.repository.adapter';
import { DrizzleCommentRepositoryAdapter } from '../../adapters/repositories/drizzle/comment.repository.adapter';
import { BetterAuthAdapter } from '../../adapters/auth/better-auth/auth.adapter';

// Use cases
import { CreateSplitUseCase } from '../../core/usecases/split/create-split.usecase';
import { UpdateSplitUseCase } from '../../core/usecases/split/update-split.usecase';
import { DeleteSplitUseCase } from '../../core/usecases/split/delete-split.usecase';
import { GetSplitUseCase } from '../../core/usecases/split/get-split.usecase';
import { SearchSplitsUseCase } from '../../core/usecases/split/search-splits.usecase';

import { CreateExerciseUseCase } from '../../core/usecases/exercise/create-exercise.usecase';
import { UpdateExerciseUseCase } from '../../core/usecases/exercise/update-exercise.usecase';
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

	// Services (adapters)
	private _authService?: BetterAuthAdapter;

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

	get authService(): BetterAuthAdapter {
		if (!this._authService) {
			this._authService = new BetterAuthAdapter(auth);
		}
		return this._authService;
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
}

/**
 * Global container instance
 */
export const container = new Container();
