import { eq, and, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { personalRecords, exercises } from '$lib/server/db/schema';
import type * as schema from '$lib/server/db/schema';
import type { IPersonalRecordRepository } from '../../../core/ports/repositories/personal-record.repository.port';
import type { PersonalRecordDto } from '../../../core/domain/workout/workout.dto';
import { PersonalRecord } from '../../../core/domain/workout/personal-record.entity';

export class DrizzlePersonalRecordRepositoryAdapter implements IPersonalRecordRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<PersonalRecord | undefined> {
		const result = await this.db
			.select()
			.from(personalRecords)
			.where(eq(personalRecords.id, id))
			.limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByUserIdAndExerciseId(
		userId: string,
		exerciseId: string
	): Promise<PersonalRecord | undefined> {
		const result = await this.db
			.select()
			.from(personalRecords)
			.where(and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)))
			.limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByUserId(userId: string): Promise<PersonalRecordDto[]> {
		const records = await this.db
			.select({
				pr: personalRecords,
				exercise: {
					id: exercises.id,
					name: exercises.name,
					muscleGroup: exercises.muscleGroup
				}
			})
			.from(personalRecords)
			.innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
			.where(eq(personalRecords.userId, userId))
			.orderBy(desc(personalRecords.achievedAt));

		return records.map((r) => {
			const entity = this.toEntity(r.pr);
			return {
				id: r.pr.id,
				userId: r.pr.userId,
				exerciseId: r.pr.exerciseId,
				weight: r.pr.weight,
				reps: r.pr.reps,
				achievedAt: r.pr.achievedAt,
				exercise: r.exercise,
				oneRepMax: entity.calculateOneRepMax()
			};
		});
	}

	async upsert(
		userId: string,
		exerciseId: string,
		weight: number,
		reps: number,
		achievedAt: Date
	): Promise<PersonalRecord> {
		const existing = await this.findByUserIdAndExerciseId(userId, exerciseId);

		if (existing) {
			const [updated] = await this.db
				.update(personalRecords)
				.set({
					weight,
					reps,
					achievedAt,
					updatedAt: new Date()
				})
				.where(eq(personalRecords.id, existing.id))
				.returning();
			return this.toEntity(updated);
		} else {
			const [created] = await this.db
				.insert(personalRecords)
				.values({
					userId,
					exerciseId,
					weight,
					reps,
					achievedAt
				})
				.returning();
			return this.toEntity(created);
		}
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(personalRecords).where(eq(personalRecords.id, id));
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: personalRecords.id })
			.from(personalRecords)
			.where(and(eq(personalRecords.id, id), eq(personalRecords.userId, userId)))
			.limit(1);
		return result.length > 0;
	}

	private toEntity(raw: typeof personalRecords.$inferSelect): PersonalRecord {
		return new PersonalRecord(
			raw.id,
			raw.userId,
			raw.exerciseId,
			raw.weight,
			raw.reps,
			raw.achievedAt,
			raw.createdAt,
			raw.updatedAt
		);
	}
}
