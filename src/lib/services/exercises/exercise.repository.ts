import { eq, and, like, or } from 'drizzle-orm';
import { exercises } from '$lib/server/db/schema';
import { BaseRepository } from '../shared/utils';
import type { Exercise, CreateExerciseInput, UpdateExerciseInput, ExerciseFilters } from './types';

export class ExerciseRepository extends BaseRepository {
	async findById(id: string): Promise<Exercise | undefined> {
		const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
		return result[0];
	}

	async findByUserId(userId: string): Promise<Exercise[]> {
		return this.db
			.select()
			.from(exercises)
			.where(eq(exercises.userId, userId))
			.orderBy(exercises.name);
	}

	async findWithFilters(filters: ExerciseFilters): Promise<Exercise[]> {
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

		return this.db.select().from(exercises).where(whereClause).orderBy(exercises.name);
	}

	async create(input: CreateExerciseInput): Promise<Exercise> {
		const [exercise] = await this.db
			.insert(exercises)
			.values({
				...input,
				description: input.description ?? null,
				imageUrl: input.imageUrl ?? null,
				videoUrl: input.videoUrl ?? null
			})
			.returning();
		return exercise;
	}

	async update(id: string, input: UpdateExerciseInput): Promise<Exercise> {
		const [updatedExercise] = await this.db
			.update(exercises)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(exercises.id, id))
			.returning();
		return updatedExercise;
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
}
