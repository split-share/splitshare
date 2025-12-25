import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { CreateSplitDto } from '../../domain/split/split.dto';
import type { Split } from '../../domain/split/split.entity';
import { Split as SplitEntity } from '../../domain/split/split.entity';
import { SplitDay } from '../../domain/split/split-day.entity';
import { DayExercise } from '../../domain/split/day-exercise.entity';

/**
 * Use case: Create a new split
 */
export class CreateSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	async execute(input: CreateSplitDto): Promise<Split> {
		// Validate split
		SplitEntity.validateTitle(input.title);
		SplitEntity.validateDifficulty(input.difficulty);

		if (!input.days || input.days.length === 0) {
			throw new Error('At least one day is required');
		}

		// Validate days
		const dayNumbers = new Set<number>();
		for (const day of input.days) {
			SplitDay.validateDayNumber(day.dayNumber);
			SplitDay.validateName(day.name);

			if (dayNumbers.has(day.dayNumber)) {
				throw new Error(`Duplicate day number: ${day.dayNumber}`);
			}
			dayNumbers.add(day.dayNumber);

			// Validate exercises for non-rest days
			if (!day.isRestDay) {
				if (!day.exercises || day.exercises.length === 0) {
					throw new Error(
						`Day ${day.dayNumber} must have at least one exercise or be marked as rest day`
					);
				}

				const exerciseOrders = new Set<number>();
				for (const exercise of day.exercises) {
					DayExercise.validateSets(exercise.sets);
					DayExercise.validateReps(exercise.reps);
					DayExercise.validateWeight(exercise.weight ?? null);

					if (exerciseOrders.has(exercise.order)) {
						throw new Error(`Duplicate exercise order in day ${day.dayNumber}`);
					}
					exerciseOrders.add(exercise.order);
				}
			}
		}

		return this.splitRepository.createWithDays(input);
	}
}
