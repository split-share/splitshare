import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import type { ExerciseFiltersDto } from '../../domain/exercise/exercise.dto';
import type { Exercise } from '../../domain/exercise/exercise.entity';

/**
 * Use case for searching exercises with filters
 */
export class SearchExercisesUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

	/**
	 * Searches exercises with optional filters
	 * @param {ExerciseFiltersDto} filters - Filter criteria (muscle group, equipment, search query, etc.)
	 * @returns {Promise<Exercise[]>} List of exercises matching criteria
	 */
	async execute(filters: ExerciseFiltersDto): Promise<Exercise[]> {
		return this.exerciseRepository.findWithFilters(filters);
	}
}
