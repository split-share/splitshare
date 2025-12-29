/**
 * Represents a single cell in the muscle group heatmap
 */
export interface MuscleHeatmapCellDto {
	muscleGroup: string;
	date: string; // ISO date string (YYYY-MM-DD)
	totalSets: number;
}

/**
 * Complete heatmap data for rendering
 */
export interface MuscleHeatmapDataDto {
	cells: MuscleHeatmapCellDto[];
	muscleGroups: string[]; // Ordered list of muscle groups (rows)
	dates: string[]; // Ordered list of dates (columns)
	maxSets: number; // For color intensity scaling
}
