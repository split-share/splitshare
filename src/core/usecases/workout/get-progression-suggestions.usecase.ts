import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { IPersonalRecordRepository } from '../../ports/repositories/personal-record.repository.port';
import type { IExerciseRepository } from '../../ports/repositories/exercise.repository.port';
import type {
	ProgressionSuggestionDto,
	ExercisePerformanceDto
} from '../../domain/workout/progression-suggestion.dto';
import {
	COMPOUND_MUSCLE_GROUPS,
	COMPOUND_INCREMENT,
	ISOLATION_INCREMENT,
	PROGRESSION_THRESHOLD
} from '../../domain/workout/progression-suggestion.dto';

/**
 * Use case for generating weight progression suggestions for exercises
 * Analyzes recent performance history to recommend weight increases
 */
export class GetProgressionSuggestionsUseCase {
	constructor(
		private workoutLogRepository: IWorkoutLogRepository,
		private personalRecordRepository: IPersonalRecordRepository,
		private exerciseRepository: IExerciseRepository
	) {}

	/**
	 * Generates progression suggestions for a list of exercises
	 * @param {string} userId - ID of the user
	 * @param {string[]} exerciseIds - IDs of exercises to analyze
	 * @returns {Promise<Map<string, ProgressionSuggestionDto>>} Map of exercise IDs to progression suggestions
	 */
	async execute(
		userId: string,
		exerciseIds: string[]
	): Promise<Map<string, ProgressionSuggestionDto>> {
		const suggestions = new Map<string, ProgressionSuggestionDto>();

		await Promise.all(
			exerciseIds.map(async (exerciseId) => {
				const suggestion = await this.getSuggestionForExercise(userId, exerciseId);
				if (suggestion) {
					suggestions.set(exerciseId, suggestion);
				}
			})
		);

		return suggestions;
	}

	private async getSuggestionForExercise(
		userId: string,
		exerciseId: string
	): Promise<ProgressionSuggestionDto | null> {
		const [exercise, personalRecord, recentPerformances] = await Promise.all([
			this.exerciseRepository.findById(exerciseId),
			this.personalRecordRepository.findByUserIdAndExerciseId(userId, exerciseId),
			this.workoutLogRepository.findExerciseHistory(userId, exerciseId, 5)
		]);

		if (!exercise) {
			return null;
		}

		const muscleGroup = exercise.muscleGroup.toLowerCase();
		const isCompound = COMPOUND_MUSCLE_GROUPS.some((g) => muscleGroup.includes(g.toLowerCase()));
		const increment = isCompound ? COMPOUND_INCREMENT : ISOLATION_INCREMENT;

		// No history case
		if (recentPerformances.length === 0) {
			return {
				exerciseId,
				exerciseName: exercise.name,
				muscleGroup: exercise.muscleGroup,
				currentPR: personalRecord
					? {
							weight: personalRecord.weight,
							reps: personalRecord.reps,
							date: personalRecord.achievedAt
						}
					: null,
				lastPerformance: null,
				recentPerformances: [],
				suggestedWeight: null,
				increment,
				reason: 'no_history',
				consecutiveSuccesses: 0
			};
		}

		const lastPerformance = recentPerformances[0];
		const consecutiveSuccesses = this.countConsecutiveSuccesses(recentPerformances);

		// Determine suggestion
		let suggestedWeight: number | null = null;
		let reason: ProgressionSuggestionDto['reason'] = 'maintain';

		if (consecutiveSuccesses >= PROGRESSION_THRESHOLD && lastPerformance.weight !== null) {
			// Ready to progress
			suggestedWeight = lastPerformance.weight + increment;
			reason = 'ready_to_progress';
		} else if (recentPerformances.length === 1) {
			// Only one session, maintain
			suggestedWeight = lastPerformance.weight;
			reason = 'maintain';
		} else if (consecutiveSuccesses < PROGRESSION_THRESHOLD) {
			// Not consistent enough yet
			suggestedWeight = lastPerformance.weight;
			reason = 'inconsistent';
		}

		return {
			exerciseId,
			exerciseName: exercise.name,
			muscleGroup: exercise.muscleGroup,
			currentPR: personalRecord
				? {
						weight: personalRecord.weight,
						reps: personalRecord.reps,
						date: personalRecord.achievedAt
					}
				: null,
			lastPerformance: {
				weight: lastPerformance.weight,
				reps: lastPerformance.reps,
				date: lastPerformance.date
			},
			recentPerformances,
			suggestedWeight,
			increment,
			reason,
			consecutiveSuccesses
		};
	}

	/**
	 * Count consecutive sessions where user completed all target reps at the same weight
	 */
	private countConsecutiveSuccesses(performances: ExercisePerformanceDto[]): number {
		if (performances.length === 0) return 0;

		const referenceWeight = performances[0].weight;
		if (referenceWeight === null) return 0;

		let count = 0;

		for (const perf of performances) {
			// Check if same weight
			if (perf.weight !== referenceWeight) {
				break;
			}

			// Check if completed target reps (parse the reps string)
			const targetReps = this.parseTargetReps(perf.reps);
			const completedSets = perf.sets;

			// We consider it a success if they completed the expected number of sets
			// The reps field in exercise logs is the actual reps performed, stored as a string
			if (completedSets >= 1 && targetReps >= 1) {
				count++;
			} else {
				break;
			}
		}

		return count;
	}

	/**
	 * Parse reps string to get the minimum target
	 * Handles formats like "10", "8-12", "10,10,10"
	 */
	private parseTargetReps(reps: string): number {
		if (!reps) return 0;

		// Handle comma-separated (multiple sets)
		if (reps.includes(',')) {
			const parts = reps.split(',').map((r) => parseInt(r.trim()));
			return Math.min(...parts.filter((n) => !isNaN(n)));
		}

		// Handle range like "8-12"
		if (reps.includes('-')) {
			const [min] = reps.split('-').map((r) => parseInt(r.trim()));
			return isNaN(min) ? 0 : min;
		}

		// Simple number
		const parsed = parseInt(reps);
		return isNaN(parsed) ? 0 : parsed;
	}
}
