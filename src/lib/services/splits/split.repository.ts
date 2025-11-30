import { eq, and, like, or, sql, desc, inArray } from 'drizzle-orm';
import {
	splits,
	splitDays,
	dayExercises,
	exercises,
	user,
	likes,
	comments
} from '$lib/server/db/schema';
import { BaseRepository } from '../shared/utils';
import type {
	Split,
	CreateSplitInput,
	UpdateSplitInput,
	SplitFilters,
	PaginationOptions,
	SplitWithDetails,
	SplitDayWithExercises
} from './types';

export class SplitRepository extends BaseRepository {
	async findById(id: string): Promise<Split | undefined> {
		const result = await this.db.select().from(splits).where(eq(splits.id, id)).limit(1);
		return result[0];
	}

	async findByIdWithDetails(
		id: string,
		currentUserId?: string
	): Promise<SplitWithDetails | undefined> {
		const [split] = await this.db
			.select({
				split: splits,
				author: {
					id: user.id,
					name: user.name,
					image: user.image
				},
				likesCount: sql<number>`cast(count(distinct ${likes.id}) as integer)`,
				commentsCount: sql<number>`cast(count(distinct ${comments.id}) as integer)`,
				isLiked: currentUserId
					? sql<boolean>`exists(
						select 1 from ${likes}
						where ${likes.splitId} = ${splits.id}
						and ${likes.userId} = ${currentUserId}
					)`
					: sql<boolean>`false`
			})
			.from(splits)
			.innerJoin(user, eq(splits.userId, user.id))
			.leftJoin(likes, eq(splits.id, likes.splitId))
			.leftJoin(comments, eq(splits.id, comments.splitId))
			.where(eq(splits.id, id))
			.groupBy(splits.id, user.id, user.name, user.image);

		if (!split) return undefined;

		const days = await this.findDaysBySplitId(split.split.id);

		return {
			split: split.split,
			author: split.author,
			days,
			likesCount: split.likesCount,
			commentsCount: split.commentsCount,
			isLiked: split.isLiked
		};
	}

	async findDaysBySplitId(splitId: string): Promise<SplitDayWithExercises[]> {
		// Fetch all days for the split
		const days = await this.db
			.select()
			.from(splitDays)
			.where(eq(splitDays.splitId, splitId))
			.orderBy(splitDays.dayNumber);

		if (days.length === 0) return [];

		// Fetch all exercises for all days in a single query
		const dayIds = days.map((day) => day.id);
		const allDayExercises = await this.db
			.select({
				dayExercise: dayExercises,
				exercise: exercises
			})
			.from(dayExercises)
			.innerJoin(exercises, eq(dayExercises.exerciseId, exercises.id))
			.where(inArray(dayExercises.dayId, dayIds))
			.orderBy(dayExercises.order);

		// Group exercises by day ID
		const exercisesByDayId = new Map<string, typeof allDayExercises>();
		for (const item of allDayExercises) {
			const dayId = item.dayExercise.dayId;
			if (!exercisesByDayId.has(dayId)) {
				exercisesByDayId.set(dayId, []);
			}
			exercisesByDayId.get(dayId)!.push(item);
		}

		// Map days with their exercises
		return days.map((day) => ({
			...day,
			exercises: (exercisesByDayId.get(day.id) || []).map((item) => ({
				...item.dayExercise,
				exercise: item.exercise
			}))
		}));
	}

	async findByUserId(userId: string): Promise<Split[]> {
		return this.db
			.select()
			.from(splits)
			.where(eq(splits.userId, userId))
			.orderBy(desc(splits.createdAt));
	}

	async findWithFilters(
		filters: SplitFilters,
		pagination: PaginationOptions,
		currentUserId?: string
	): Promise<SplitWithDetails[]> {
		const conditions = [];

		if (filters.userId) {
			conditions.push(eq(splits.userId, filters.userId));
		}

		if (filters.isPublic !== undefined) {
			conditions.push(eq(splits.isPublic, filters.isPublic));
		}

		if (filters.isDefault !== undefined) {
			conditions.push(eq(splits.isDefault, filters.isDefault));
		}

		if (filters.difficulty) {
			conditions.push(eq(splits.difficulty, filters.difficulty));
		}

		if (filters.tags && filters.tags.length > 0) {
			conditions.push(sql`${splits.tags} && ${filters.tags}`);
		}

		if (filters.search) {
			conditions.push(
				or(
					like(splits.title, `%${filters.search}%`),
					like(splits.description, `%${filters.search}%`)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const results = await this.db
			.select({
				split: splits,
				author: {
					id: user.id,
					name: user.name,
					image: user.image
				},
				likesCount: sql<number>`cast(count(distinct ${likes.id}) as integer)`,
				commentsCount: sql<number>`cast(count(distinct ${comments.id}) as integer)`,
				isLiked: currentUserId
					? sql<boolean>`exists(
						select 1 from ${likes}
						where ${likes.splitId} = ${splits.id}
						and ${likes.userId} = ${currentUserId}
					)`
					: sql<boolean>`false`
			})
			.from(splits)
			.innerJoin(user, eq(splits.userId, user.id))
			.leftJoin(likes, eq(splits.id, likes.splitId))
			.leftJoin(comments, eq(splits.id, comments.splitId))
			.where(whereClause)
			.groupBy(splits.id, user.id, user.name, user.image)
			.orderBy(desc(splits.createdAt))
			.limit(pagination.limit)
			.offset(pagination.offset);

		if (results.length === 0) return [];

		// Fetch all days and exercises for all splits in optimized queries
		const splitIds = results.map((r) => r.split.id);

		// Fetch all days for all splits
		const allDays = await this.db
			.select()
			.from(splitDays)
			.where(inArray(splitDays.splitId, splitIds))
			.orderBy(splitDays.dayNumber);

		// Group days by split ID
		const daysBySplitId = new Map<string, typeof allDays>();
		for (const day of allDays) {
			if (!daysBySplitId.has(day.splitId)) {
				daysBySplitId.set(day.splitId, []);
			}
			daysBySplitId.get(day.splitId)!.push(day);
		}

		// Fetch all exercises for all days
		const dayIds = allDays.map((day) => day.id);
		const allDayExercises =
			dayIds.length > 0
				? await this.db
						.select({
							dayExercise: dayExercises,
							exercise: exercises
						})
						.from(dayExercises)
						.innerJoin(exercises, eq(dayExercises.exerciseId, exercises.id))
						.where(inArray(dayExercises.dayId, dayIds))
						.orderBy(dayExercises.order)
				: [];

		// Group exercises by day ID
		const exercisesByDayId = new Map<string, typeof allDayExercises>();
		for (const item of allDayExercises) {
			const dayId = item.dayExercise.dayId;
			if (!exercisesByDayId.has(dayId)) {
				exercisesByDayId.set(dayId, []);
			}
			exercisesByDayId.get(dayId)!.push(item);
		}

		// Build final result with days and exercises
		return results.map((result) => {
			const splitDays = daysBySplitId.get(result.split.id) || [];
			const daysWithExercises = splitDays.map((day) => ({
				...day,
				exercises: (exercisesByDayId.get(day.id) || []).map((item) => ({
					...item.dayExercise,
					exercise: item.exercise
				}))
			}));

			return {
				split: result.split,
				author: result.author,
				days: daysWithExercises,
				likesCount: result.likesCount,
				commentsCount: result.commentsCount,
				isLiked: result.isLiked
			};
		});
	}

	async createWithDays(input: CreateSplitInput): Promise<Split> {
		return await this.db.transaction(async (tx) => {
			// Insert split
			const [split] = await tx
				.insert(splits)
				.values({
					userId: input.userId,
					title: input.title,
					description: input.description ?? null,
					isPublic: input.isPublic ?? false,
					isDefault: input.isDefault ?? false,
					difficulty: input.difficulty,
					duration: input.duration ?? null,
					imageUrl: input.imageUrl ?? null,
					tags: input.tags ?? null
				})
				.returning();

			// Insert days with exercises
			for (const dayInput of input.days) {
				const [day] = await tx
					.insert(splitDays)
					.values({
						splitId: split.id,
						dayNumber: dayInput.dayNumber,
						name: dayInput.name,
						isRestDay: dayInput.isRestDay
					})
					.returning();

				// Insert exercises for this day if not a rest day
				if (!dayInput.isRestDay && dayInput.exercises.length > 0) {
					const exerciseValues = dayInput.exercises.map((ex) => ({
						dayId: day.id,
						exerciseId: ex.exerciseId ?? null,
						exerciseName: ex.exerciseName,
						sets: ex.sets,
						reps: ex.reps,
						restTime: ex.restTime ?? null,
						order: ex.order,
						notes: ex.notes ?? null
					}));

					await tx.insert(dayExercises).values(exerciseValues);
				}
			}

			return split;
		});
	}

	async update(id: string, input: UpdateSplitInput): Promise<Split> {
		const [updatedSplit] = await this.db
			.update(splits)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(splits.id, id))
			.returning();
		return updatedSplit;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(splits).where(eq(splits.id, id));
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: splits.id })
			.from(splits)
			.where(eq(splits.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: splits.id })
			.from(splits)
			.where(and(eq(splits.id, id), eq(splits.userId, userId)))
			.limit(1);
		return result.length > 0;
	}
}
