import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type {
	MuscleHeatmapDataDto,
	MuscleHeatmapCellDto
} from '../../domain/workout/muscle-heatmap.dto';
import { MUSCLE_GROUPS } from '$lib/constants';

export class GetMuscleHeatmapUseCase {
	constructor(private workoutLogRepository: IWorkoutLogRepository) {}

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
