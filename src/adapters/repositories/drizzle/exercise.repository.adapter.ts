import { eq, and, like, or, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { exercises } from '$lib/server/db/schema';
import type * as schema from '$lib/server/db/schema';
import type { IExerciseRepository } from '../../../core/ports/repositories/exercise.repository.port';
import type {
	CreateExerciseDto,
	UpdateExerciseDto,
	ExerciseFiltersDto
} from '../../../core/domain/exercise/exercise.dto';
import { Exercise } from '../../../core/domain/exercise/exercise.entity';

/**
 * Drizzle adapter for Exercise repository
 */
export class DrizzleExerciseRepositoryAdapter implements IExerciseRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<Exercise | undefined> {
		const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByUserId(userId: string): Promise<Exercise[]> {
		const results = await this.db
			.select()
			.from(exercises)
			.where(eq(exercises.userId, userId))
			.orderBy(desc(exercises.createdAt));

		return results.map((r) => this.toEntity(r));
	}

	async findWithFilters(filters: ExerciseFiltersDto): Promise<Exercise[]> {
		const conditions = [];

		if (filters.userId) {
			conditions.push(eq(exercises.userId, filters.userId));
		}

		if (filters.muscleGroup) {
			conditions.push(eq(exercises.muscleGroup, filters.muscleGroup));
		}

		if (filters.equipmentType) {
			conditions.push(eq(exercises.equipmentType, filters.equipmentType));
		}

		if (filters.difficulty) {
			conditions.push(eq(exercises.difficulty, filters.difficulty));
		}

		if (filters.search) {
			conditions.push(
				or(
					like(exercises.name, `%${filters.search}%`),
					like(exercises.description, `%${filters.search}%`)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const results = await this.db
			.select()
			.from(exercises)
			.where(whereClause)
			.orderBy(desc(exercises.createdAt));

		return results.map((r) => this.toEntity(r));
	}

	async create(data: CreateExerciseDto): Promise<Exercise> {
		const [exercise] = await this.db
			.insert(exercises)
			.values({
				userId: data.userId,
				name: data.name,
				description: data.description ?? null,
				difficulty: data.difficulty,
				muscleGroup: data.muscleGroup,
				equipmentType: data.equipmentType,
				imageUrl: data.imageUrl ?? null,
				gifUrl: data.gifUrl ?? null
			})
			.returning();

		return this.toEntity(exercise);
	}

	async update(id: string, data: UpdateExerciseDto): Promise<Exercise> {
		const [updatedExercise] = await this.db
			.update(exercises)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(exercises.id, id))
			.returning();

		return this.toEntity(updatedExercise);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(exercises).where(eq(exercises.id, id));
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: exercises.id })
			.from(exercises)
			.where(eq(exercises.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: exercises.id })
			.from(exercises)
			.where(and(eq(exercises.id, id), eq(exercises.userId, userId)))
			.limit(1);
		return result.length > 0;
	}

	private toEntity(raw: typeof exercises.$inferSelect): Exercise {
		return new Exercise(
			raw.id,
			raw.userId,
			raw.name,
			raw.description,
			raw.difficulty as 'beginner' | 'intermediate' | 'advanced',
			raw.muscleGroup,
			raw.equipmentType,
			raw.imageUrl,
			raw.gifUrl,
			raw.createdAt,
			raw.updatedAt
		);
	}
}
