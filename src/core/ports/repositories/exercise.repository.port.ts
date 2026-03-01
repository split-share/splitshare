import type { Exercise } from '../../domain/exercise/exercise.entity';
import type {
	CreateExerciseDto,
	UpdateExerciseDto,
	ExerciseFiltersDto
} from '../../domain/exercise/exercise.dto';

/**
 * Port (interface) for Exercise repository
 * Any database implementation must implement this interface
 */
export interface IExerciseRepository {
	/**
	 * Finds exercise by ID
	 */
	findById(id: string): Promise<Exercise | undefined>;

	/**
	 * Finds exercises by IDs (batch)
	 */
	findByIds(ids: string[]): Promise<Exercise[]>;

	/**
	 * Finds all exercises for a user
	 */
	findByUserId(userId: string): Promise<Exercise[]>;

	/**
	 * Finds exercises with filters
	 */
	findWithFilters(filters: ExerciseFiltersDto): Promise<Exercise[]>;

	/**
	 * Creates an exercise
	 */
	create(data: CreateExerciseDto): Promise<Exercise>;

	/**
	 * Updates an exercise
	 */
	update(id: string, data: UpdateExerciseDto): Promise<Exercise>;

	/**
	 * Deletes an exercise
	 */
	delete(id: string): Promise<void>;

	/**
	 * Checks if exercise exists
	 */
	exists(id: string): Promise<boolean>;

	/**
	 * Checks if user owns the exercise
	 */
	isOwnedByUser(id: string, userId: string): Promise<boolean>;
}
