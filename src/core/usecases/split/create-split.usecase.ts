import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { CreateSplitDto } from '../../domain/split/split.dto';
import type { Split } from '../../domain/split/split.entity';
import { BusinessRuleError } from '../../domain/common/errors';

/**
 * Use case: Create a new split
 */
export class CreateSplitUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	async execute(input: CreateSplitDto): Promise<Split> {
		if (!input.days || input.days.length === 0) {
			throw new BusinessRuleError('At least one day is required');
		}

		// Validate days
		const dayNumbers = new Set<number>();
		for (const day of input.days) {
			if (dayNumbers.has(day.dayNumber)) {
				throw new BusinessRuleError(`Duplicate day number: ${day.dayNumber}`);
			}
			dayNumbers.add(day.dayNumber);

			// Validate exercises for non-rest days
			if (!day.isRestDay) {
				if (!day.exercises || day.exercises.length === 0) {
					throw new BusinessRuleError(
						`Day ${day.dayNumber} must have at least one exercise or be marked as rest day`
					);
				}

				const exerciseOrders = new Set<number>();
				for (const exercise of day.exercises) {
					if (exerciseOrders.has(exercise.order)) {
						throw new BusinessRuleError(`Duplicate exercise order in day ${day.dayNumber}`);
					}
					exerciseOrders.add(exercise.order);
				}
			}
		}

		return this.splitRepository.createWithDays(input);
	}
}
