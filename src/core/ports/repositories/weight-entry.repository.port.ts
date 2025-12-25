import type { WeightEntry } from '../../domain/weight/weight-entry.entity';
import type {
	CreateWeightEntryDto,
	UpdateWeightEntryDto,
	WeightEntryWithStatsDto,
	WeightStatsDto,
	WeightChartDataDto
} from '../../domain/weight/weight-entry.dto';

export interface IWeightEntryRepository {
	findById(id: string): Promise<WeightEntry | undefined>;

	findByUserId(userId: string, limit?: number): Promise<WeightEntryWithStatsDto[]>;

	findByUserIdAndDateRange(
		userId: string,
		startDate: Date,
		endDate: Date
	): Promise<WeightChartDataDto[]>;

	create(data: CreateWeightEntryDto): Promise<WeightEntry>;

	update(id: string, data: UpdateWeightEntryDto): Promise<WeightEntry>;

	delete(id: string): Promise<void>;

	exists(id: string): Promise<boolean>;

	isOwnedByUser(id: string, userId: string): Promise<boolean>;

	getUserStats(userId: string): Promise<WeightStatsDto>;

	getChartData(userId: string, limit?: number): Promise<WeightChartDataDto[]>;

	existsForDate(userId: string, date: Date): Promise<boolean>;
}
