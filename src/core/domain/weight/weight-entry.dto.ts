export interface CreateWeightEntryDto {
	userId: string;
	weight: number;
	recordedAt: Date;
	notes?: string | null;
}

export interface UpdateWeightEntryDto {
	weight?: number;
	recordedAt?: Date;
	notes?: string | null;
}

export interface WeightEntryWithStatsDto {
	id: string;
	userId: string;
	weight: number;
	recordedAt: Date;
	notes: string | null;
	change: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface WeightStatsDto {
	currentWeight: number | null;
	totalChange: number | null;
	averageWeight: number | null;
	highestWeight: number | null;
	lowestWeight: number | null;
	totalEntries: number;
	firstEntryDate: Date | null;
	latestEntryDate: Date | null;
}

export interface WeightChartDataDto {
	date: Date;
	weight: number;
}
