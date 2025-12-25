import { eq, and, desc, asc, gte, lte, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { weightEntries } from '$lib/server/db/schema';
import type * as schema from '$lib/server/db/schema';
import type { IWeightEntryRepository } from '../../../core/ports/repositories/weight-entry.repository.port';
import type {
	CreateWeightEntryDto,
	UpdateWeightEntryDto,
	WeightEntryWithStatsDto,
	WeightStatsDto,
	WeightChartDataDto
} from '../../../core/domain/weight/weight-entry.dto';
import { WeightEntry } from '../../../core/domain/weight/weight-entry.entity';

export class DrizzleWeightEntryRepositoryAdapter implements IWeightEntryRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<WeightEntry | undefined> {
		const result = await this.db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.id, id))
			.limit(1);

		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByUserId(userId: string, limit = 100): Promise<WeightEntryWithStatsDto[]> {
		const entries = await this.db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, userId))
			.orderBy(desc(weightEntries.recordedAt))
			.limit(limit);

		if (entries.length === 0) return [];

		return entries.map((entry, index) => {
			const previousEntry = entries[index + 1];
			const change = previousEntry ? Number(entry.weight) - Number(previousEntry.weight) : null;

			return {
				id: entry.id,
				userId: entry.userId,
				weight: Number(entry.weight),
				recordedAt: entry.recordedAt,
				notes: entry.notes,
				change,
				createdAt: entry.createdAt,
				updatedAt: entry.updatedAt
			};
		});
	}

	async findByUserIdAndDateRange(
		userId: string,
		startDate: Date,
		endDate: Date
	): Promise<WeightChartDataDto[]> {
		const entries = await this.db
			.select({
				recordedAt: weightEntries.recordedAt,
				weight: weightEntries.weight
			})
			.from(weightEntries)
			.where(
				and(
					eq(weightEntries.userId, userId),
					gte(weightEntries.recordedAt, startDate),
					lte(weightEntries.recordedAt, endDate)
				)
			)
			.orderBy(asc(weightEntries.recordedAt));

		return entries.map((e) => ({
			date: e.recordedAt,
			weight: Number(e.weight)
		}));
	}

	async existsForDate(userId: string, date: Date): Promise<boolean> {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		const result = await this.db
			.select({ id: weightEntries.id })
			.from(weightEntries)
			.where(
				and(
					eq(weightEntries.userId, userId),
					gte(weightEntries.recordedAt, startOfDay),
					lte(weightEntries.recordedAt, endOfDay)
				)
			)
			.limit(1);

		return result.length > 0;
	}

	async create(data: CreateWeightEntryDto): Promise<WeightEntry> {
		const [entry] = await this.db
			.insert(weightEntries)
			.values({
				userId: data.userId,
				weight: data.weight.toString(),
				recordedAt: data.recordedAt,
				notes: data.notes ?? null
			})
			.returning();

		return this.toEntity(entry);
	}

	async upsertByDate(data: CreateWeightEntryDto): Promise<WeightEntry> {
		const startOfDay = new Date(data.recordedAt);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(data.recordedAt);
		endOfDay.setHours(23, 59, 59, 999);

		// Check if entry exists for this date
		const existing = await this.db
			.select()
			.from(weightEntries)
			.where(
				and(
					eq(weightEntries.userId, data.userId),
					gte(weightEntries.recordedAt, startOfDay),
					lte(weightEntries.recordedAt, endOfDay)
				)
			)
			.limit(1);

		if (existing.length > 0) {
			// Update existing entry
			const [updated] = await this.db
				.update(weightEntries)
				.set({
					weight: data.weight.toString(),
					notes: data.notes ?? null,
					updatedAt: new Date()
				})
				.where(eq(weightEntries.id, existing[0].id))
				.returning();
			return this.toEntity(updated);
		}

		// Create new entry
		return this.create(data);
	}

	async update(id: string, data: UpdateWeightEntryDto): Promise<WeightEntry> {
		const updateData: Record<string, unknown> = { updatedAt: new Date() };
		if (data.weight !== undefined) updateData.weight = data.weight.toString();
		if (data.recordedAt !== undefined) updateData.recordedAt = data.recordedAt;
		if (data.notes !== undefined) updateData.notes = data.notes;

		const [updated] = await this.db
			.update(weightEntries)
			.set(updateData)
			.where(eq(weightEntries.id, id))
			.returning();

		return this.toEntity(updated);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(weightEntries).where(eq(weightEntries.id, id));
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: weightEntries.id })
			.from(weightEntries)
			.where(eq(weightEntries.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: weightEntries.id })
			.from(weightEntries)
			.where(and(eq(weightEntries.id, id), eq(weightEntries.userId, userId)))
			.limit(1);
		return result.length > 0;
	}

	async getUserStats(userId: string): Promise<WeightStatsDto> {
		const [stats] = await this.db
			.select({
				totalEntries: sql<number>`cast(count(*) as integer)`,
				averageWeight: sql<number>`cast(coalesce(avg(${weightEntries.weight}), 0) as numeric(5,2))`,
				highestWeight: sql<number>`cast(max(${weightEntries.weight}) as numeric(5,2))`,
				lowestWeight: sql<number>`cast(min(${weightEntries.weight}) as numeric(5,2))`,
				firstEntryDate: sql<Date | null>`min(${weightEntries.recordedAt})`,
				latestEntryDate: sql<Date | null>`max(${weightEntries.recordedAt})`
			})
			.from(weightEntries)
			.where(eq(weightEntries.userId, userId));

		const [latestEntry] = await this.db
			.select({ weight: weightEntries.weight })
			.from(weightEntries)
			.where(eq(weightEntries.userId, userId))
			.orderBy(desc(weightEntries.recordedAt))
			.limit(1);

		const [firstEntry] = await this.db
			.select({ weight: weightEntries.weight })
			.from(weightEntries)
			.where(eq(weightEntries.userId, userId))
			.orderBy(asc(weightEntries.recordedAt))
			.limit(1);

		const currentWeight = latestEntry ? Number(latestEntry.weight) : null;
		const totalChange =
			latestEntry && firstEntry ? Number(latestEntry.weight) - Number(firstEntry.weight) : null;

		return {
			currentWeight,
			totalChange,
			averageWeight: stats?.averageWeight ? Number(stats.averageWeight) : null,
			highestWeight: stats?.highestWeight ? Number(stats.highestWeight) : null,
			lowestWeight: stats?.lowestWeight ? Number(stats.lowestWeight) : null,
			totalEntries: stats?.totalEntries || 0,
			firstEntryDate: stats?.firstEntryDate || null,
			latestEntryDate: stats?.latestEntryDate || null
		};
	}

	async getChartData(userId: string, limit = 90): Promise<WeightChartDataDto[]> {
		const entries = await this.db
			.select({
				recordedAt: weightEntries.recordedAt,
				weight: weightEntries.weight
			})
			.from(weightEntries)
			.where(eq(weightEntries.userId, userId))
			.orderBy(desc(weightEntries.recordedAt))
			.limit(limit);

		return entries.reverse().map((e) => ({
			date: e.recordedAt,
			weight: Number(e.weight)
		}));
	}

	private toEntity(raw: typeof weightEntries.$inferSelect): WeightEntry {
		return new WeightEntry(
			raw.id,
			raw.userId,
			Number(raw.weight),
			raw.recordedAt,
			raw.notes,
			raw.createdAt,
			raw.updatedAt
		);
	}
}
