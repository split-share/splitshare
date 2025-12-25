import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import type { CreateExerciseDto } from '../../domain/exercise/exercise.dto';
import type { Exercise } from '../../domain/exercise/exercise.entity';

/**
 * Use case: Create a new exercise
 */
export class CreateExerciseUseCase {
	constructor(private exerciseRepository: IExerciseRepository) {}

	async execute(input: CreateExerciseDto): Promise<Exercise> {
		return this.exerciseRepository.create(input);
	}
}
