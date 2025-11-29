import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { IPersonalRecordRepository } from '../../ports/repositories/personal-record.repository.port';
import type { CreateWorkoutLogDto } from '../../domain/workout/workout.dto';
import type { WorkoutLog } from '../../domain/workout/workout-log.entity';
import { ExerciseLog } from '../../domain/workout/exercise-log.entity';

export class LogWorkoutUseCase {
	constructor(
		private workoutLogRepository: IWorkoutLogRepository,
		private personalRecordRepository: IPersonalRecordRepository
	) {}

	async execute(input: CreateWorkoutLogDto): Promise<WorkoutLog> {
		for (const exercise of input.exercises) {
			ExerciseLog.validateSets(exercise.sets);
			if (exercise.weight !== null && exercise.weight !== undefined) {
				ExerciseLog.validateWeight(exercise.weight);
			}
		}

		const workoutLog = await this.workoutLogRepository.createWithExercises(input);

		for (const exercise of input.exercises) {
			if (exercise.weight !== null && exercise.weight !== undefined) {
				const repsNum = parseInt(exercise.reps);
				if (!isNaN(repsNum)) {
					const existing = await this.personalRecordRepository.findByUserIdAndExerciseId(
						input.userId,
						exercise.exerciseId
					);

					const shouldUpdate =
						!existing ||
						exercise.weight > existing.weight ||
						(exercise.weight === existing.weight && repsNum > existing.reps);

					if (shouldUpdate) {
						await this.personalRecordRepository.upsert(
							input.userId,
							exercise.exerciseId,
							exercise.weight,
							repsNum,
							input.completedAt
						);
					}
				}
			}
		}

		return workoutLog;
	}
}
