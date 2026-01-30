import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type {
	MuscleHeatmapDataDto,
	MuscleHeatmapCellDto
} from '../../domain/workout/muscle-heatmap.dto';
import { MUSCLE_GROUPS } from '$lib/constants';

/**
 * Use case for generating muscle heatmap data
 * Aggregates workout volume by muscle group over a time period for visualization
 */
export class GetMuscleHeatmapUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

	/**
	 * Generates muscle heatmap data showing workout volume by muscle group and date
	 * @param {string} userId - ID of the user
	 * @param {number} days - Number of days to include in the heatmap (default: 7)
	 * @returns {Promise<MuscleHeatmapDataDto>} Heatmap data with cells, muscle groups, dates, and max sets
	 */
	async execute(userId: string, days = 7): Promise<MuscleHeatmapDataDto> {
		const endDate = new Date();
		endDate.setHours(23, 59, 59, 999);

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - (days - 1));
		startDate.setHours(0, 0, 0, 0);

		const workoutLogs = await this.workoutLogRepository.findByUserIdAndDateRange(
			userId,
			startDate,
			endDate
		);

		// Aggregate sets by muscle group and date
		const aggregation = new Map<string, number>(); // key: "muscleGroup|date"

		for (const log of workoutLogs) {
			const dateStr = this.formatDate(log.completedAt);
			for (const exercise of log.exercises) {
				const key = `${exercise.exercise.muscleGroup}|${dateStr}`;
				const current = aggregation.get(key) || 0;
				aggregation.set(key, current + exercise.sets);
			}
		}

		// Build date array for the period
		const dates: string[] = [];
		for (let i = 0; i < days; i++) {
			const d = new Date(startDate);
			d.setDate(d.getDate() + i);
			dates.push(this.formatDate(d));
		}

		// Build cells array
		const cells: MuscleHeatmapCellDto[] = [];
		let maxSets = 0;

		for (const muscleGroup of MUSCLE_GROUPS) {
			for (const date of dates) {
				const key = `${muscleGroup}|${date}`;
				const totalSets = aggregation.get(key) || 0;
				cells.push({ muscleGroup, date, totalSets });
				if (totalSets > maxSets) maxSets = totalSets;
			}
		}

		return {
			cells,
			muscleGroups: [...MUSCLE_GROUPS],
			dates,
			maxSets
		};
	}

	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
}
