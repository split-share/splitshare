import type { WorkoutSession } from '../../domain/workout/workout-session.entity';
import type {
	CreateWorkoutSessionDto,
	UpdateWorkoutSessionDto,
	WorkoutSessionWithDetailsDto
} from '../../domain/workout/workout-session.dto';

export interface IWorkoutSessionRepository {
	findById(id: string): Promise<WorkoutSession | undefined>;

	findByIdWithDetails(id: string): Promise<WorkoutSessionWithDetailsDto | undefined>;

	findActiveByUserId(userId: string): Promise<WorkoutSession | undefined>;

	findActiveByUserIdWithDetails(userId: string): Promise<WorkoutSessionWithDetailsDto | undefined>;

	create(data: CreateWorkoutSessionDto): Promise<WorkoutSession>;

	update(id: string, data: UpdateWorkoutSessionDto): Promise<WorkoutSession>;

	delete(id: string): Promise<void>;

	exists(id: string): Promise<boolean>;

	isOwnedByUser(id: string, userId: string): Promise<boolean>;
}
