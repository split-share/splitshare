import type { WorkoutLog } from '../../domain/workout/workout-log.entity';
import type {
	CreateWorkoutLogDto,
	UpdateWorkoutLogDto,
	WorkoutLogWithDetailsDto,
	WorkoutStatsDto
} from '../../domain/workout/workout.dto';

export interface IWorkoutLogRepository {
	findById(id: string): Promise<WorkoutLog | undefined>;

	findByIdWithDetails(id: string): Promise<WorkoutLogWithDetailsDto | undefined>;

	findByUserId(userId: string, limit?: number): Promise<WorkoutLogWithDetailsDto[]>;

	findByUserIdAndDateRange(
		userId: string,
		startDate: Date,
		endDate: Date
	): Promise<WorkoutLogWithDetailsDto[]>;

	createWithExercises(data: CreateWorkoutLogDto): Promise<WorkoutLog>;

	update(id: string, data: UpdateWorkoutLogDto): Promise<WorkoutLog>;

	delete(id: string): Promise<void>;

	exists(id: string): Promise<boolean>;

	isOwnedByUser(id: string, userId: string): Promise<boolean>;

	getUserStats(userId: string): Promise<WorkoutStatsDto>;
}
