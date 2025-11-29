import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { workoutLogs, exerciseLogs, exercises, splits, splitDays } from '$lib/server/db/schema';
import type * as schema from '$lib/server/db/schema';
import type { IWorkoutLogRepository } from '../../../core/ports/repositories/workout-log.repository.port';
import type {
	CreateWorkoutLogDto,
	UpdateWorkoutLogDto,
	WorkoutLogWithDetailsDto,
	WorkoutStatsDto
} from '../../../core/domain/workout/workout.dto';
import { WorkoutLog } from '../../../core/domain/workout/workout-log.entity';

export class DrizzleWorkoutLogRepositoryAdapter implements IWorkoutLogRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<WorkoutLog | undefined> {
		const result = await this.db.select().from(workoutLogs).where(eq(workoutLogs.id, id)).limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByIdWithDetails(id: string): Promise<WorkoutLogWithDetailsDto | undefined> {
		const [log] = await this.db
			.select({
				log: workoutLogs,
				split: {
					id: splits.id,
					title: splits.title
				},
				day: {
					id: splitDays.id,
					name: splitDays.name,
					dayNumber: splitDays.dayNumber
				}
			})
			.from(workoutLogs)
			.innerJoin(splits, eq(workoutLogs.splitId, splits.id))
			.innerJoin(splitDays, eq(workoutLogs.dayId, splitDays.id))
			.where(eq(workoutLogs.id, id));

		if (!log) return undefined;

		const exerciseData = await this.db
			.select({
				exerciseLog: exerciseLogs,
				exercise: {
					id: exercises.id,
					name: exercises.name,
					muscleGroup: exercises.muscleGroup
				}
			})
			.from(exerciseLogs)
			.innerJoin(exercises, eq(exerciseLogs.exerciseId, exercises.id))
			.where(eq(exerciseLogs.workoutLogId, log.log.id));

		return {
			id: log.log.id,
			userId: log.log.userId,
			splitId: log.log.splitId,
			dayId: log.log.dayId,
			duration: log.log.duration,
			notes: log.log.notes,
			completedAt: log.log.completedAt,
			split: log.split,
			day: log.day,
			exercises: exerciseData.map((e) => ({
				id: e.exerciseLog.id,
				workoutLogId: e.exerciseLog.workoutLogId,
				exerciseId: e.exerciseLog.exerciseId,
				sets: e.exerciseLog.sets,
				reps: e.exerciseLog.reps,
				weight: e.exerciseLog.weight,
				notes: e.exerciseLog.notes,
				exercise: e.exercise,
				createdAt: e.exerciseLog.createdAt
			})),
			createdAt: log.log.createdAt
		};
	}

	async findByUserId(userId: string, limit = 50): Promise<WorkoutLogWithDetailsDto[]> {
		const logs = await this.db
			.select({
				log: workoutLogs,
				split: {
					id: splits.id,
					title: splits.title
				},
				day: {
					id: splitDays.id,
					name: splitDays.name,
					dayNumber: splitDays.dayNumber
				}
			})
			.from(workoutLogs)
			.innerJoin(splits, eq(workoutLogs.splitId, splits.id))
			.innerJoin(splitDays, eq(workoutLogs.dayId, splitDays.id))
			.where(eq(workoutLogs.userId, userId))
			.orderBy(desc(workoutLogs.completedAt))
			.limit(limit);

		if (logs.length === 0) return [];

		const logIds = logs.map((l) => l.log.id);
		const allExercises = await this.db
			.select({
				exerciseLog: exerciseLogs,
				exercise: {
					id: exercises.id,
					name: exercises.name,
					muscleGroup: exercises.muscleGroup
				}
			})
			.from(exerciseLogs)
			.innerJoin(exercises, eq(exerciseLogs.exerciseId, exercises.id))
			.where(sql`${exerciseLogs.workoutLogId} = ANY(${logIds})`);

		const exercisesByLogId = new Map<string, typeof allExercises>();
		for (const e of allExercises) {
			if (!exercisesByLogId.has(e.exerciseLog.workoutLogId)) {
				exercisesByLogId.set(e.exerciseLog.workoutLogId, []);
			}
			exercisesByLogId.get(e.exerciseLog.workoutLogId)!.push(e);
		}

		return logs.map((log) => ({
			id: log.log.id,
			userId: log.log.userId,
			splitId: log.log.splitId,
			dayId: log.log.dayId,
			duration: log.log.duration,
			notes: log.log.notes,
			completedAt: log.log.completedAt,
			split: log.split,
			day: log.day,
			exercises: (exercisesByLogId.get(log.log.id) || []).map((e) => ({
				id: e.exerciseLog.id,
				workoutLogId: e.exerciseLog.workoutLogId,
				exerciseId: e.exerciseLog.exerciseId,
				sets: e.exerciseLog.sets,
				reps: e.exerciseLog.reps,
				weight: e.exerciseLog.weight,
				notes: e.exerciseLog.notes,
				exercise: e.exercise,
				createdAt: e.exerciseLog.createdAt
			})),
			createdAt: log.log.createdAt
		}));
	}

	async findByUserIdAndDateRange(
		userId: string,
		startDate: Date,
		endDate: Date
	): Promise<WorkoutLogWithDetailsDto[]> {
		const logs = await this.db
			.select({
				log: workoutLogs,
				split: {
					id: splits.id,
					title: splits.title
				},
				day: {
					id: splitDays.id,
					name: splitDays.name,
					dayNumber: splitDays.dayNumber
				}
			})
			.from(workoutLogs)
			.innerJoin(splits, eq(workoutLogs.splitId, splits.id))
			.innerJoin(splitDays, eq(workoutLogs.dayId, splitDays.id))
			.where(
				and(
					eq(workoutLogs.userId, userId),
					gte(workoutLogs.completedAt, startDate),
					lte(workoutLogs.completedAt, endDate)
				)
			)
			.orderBy(desc(workoutLogs.completedAt));

		if (logs.length === 0) return [];

		const logIds = logs.map((l) => l.log.id);
		const allExercises = await this.db
			.select({
				exerciseLog: exerciseLogs,
				exercise: {
					id: exercises.id,
					name: exercises.name,
					muscleGroup: exercises.muscleGroup
				}
			})
			.from(exerciseLogs)
			.innerJoin(exercises, eq(exerciseLogs.exerciseId, exercises.id))
			.where(sql`${exerciseLogs.workoutLogId} = ANY(${logIds})`);

		const exercisesByLogId = new Map<string, typeof allExercises>();
		for (const e of allExercises) {
			if (!exercisesByLogId.has(e.exerciseLog.workoutLogId)) {
				exercisesByLogId.set(e.exerciseLog.workoutLogId, []);
			}
			exercisesByLogId.get(e.exerciseLog.workoutLogId)!.push(e);
		}

		return logs.map((log) => ({
			id: log.log.id,
			userId: log.log.userId,
			splitId: log.log.splitId,
			dayId: log.log.dayId,
			duration: log.log.duration,
			notes: log.log.notes,
			completedAt: log.log.completedAt,
			split: log.split,
			day: log.day,
			exercises: (exercisesByLogId.get(log.log.id) || []).map((e) => ({
				id: e.exerciseLog.id,
				workoutLogId: e.exerciseLog.workoutLogId,
				exerciseId: e.exerciseLog.exerciseId,
				sets: e.exerciseLog.sets,
				reps: e.exerciseLog.reps,
				weight: e.exerciseLog.weight,
				notes: e.exerciseLog.notes,
				exercise: e.exercise,
				createdAt: e.exerciseLog.createdAt
			})),
			createdAt: log.log.createdAt
		}));
	}

	async createWithExercises(data: CreateWorkoutLogDto): Promise<WorkoutLog> {
		return await this.db.transaction(async (tx) => {
			const [log] = await tx
				.insert(workoutLogs)
				.values({
					userId: data.userId,
					splitId: data.splitId,
					dayId: data.dayId,
					duration: data.duration ?? null,
					notes: data.notes ?? null,
					completedAt: data.completedAt
				})
				.returning();

			if (data.exercises.length > 0) {
				await tx.insert(exerciseLogs).values(
					data.exercises.map((e) => ({
						workoutLogId: log.id,
						exerciseId: e.exerciseId,
						sets: e.sets,
						reps: e.reps,
						weight: e.weight ?? null,
						notes: e.notes ?? null
					}))
				);
			}

			return this.toEntity(log);
		});
	}

	async update(id: string, data: UpdateWorkoutLogDto): Promise<WorkoutLog> {
		const [updated] = await this.db
			.update(workoutLogs)
			.set(data)
			.where(eq(workoutLogs.id, id))
			.returning();
		return this.toEntity(updated);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(workoutLogs).where(eq(workoutLogs.id, id));
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: workoutLogs.id })
			.from(workoutLogs)
			.where(eq(workoutLogs.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: workoutLogs.id })
			.from(workoutLogs)
			.where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
			.limit(1);
		return result.length > 0;
	}

	async getUserStats(userId: string): Promise<WorkoutStatsDto> {
		const [stats] = await this.db
			.select({
				totalWorkouts: sql<number>`cast(count(*) as integer)`,
				totalDuration: sql<number>`cast(coalesce(sum(${workoutLogs.duration}), 0) as integer)`,
				averageDuration: sql<number>`cast(coalesce(avg(${workoutLogs.duration}), 0) as integer)`,
				lastWorkoutDate: sql<Date | null>`max(${workoutLogs.completedAt})`
			})
			.from(workoutLogs)
			.where(eq(workoutLogs.userId, userId));

		const currentStreak = await this.calculateStreak(userId);

		return {
			totalWorkouts: stats?.totalWorkouts || 0,
			totalDuration: stats?.totalDuration || 0,
			averageDuration: stats?.averageDuration || 0,
			lastWorkoutDate: stats?.lastWorkoutDate || null,
			currentStreak
		};
	}

	private async calculateStreak(userId: string): Promise<number> {
		const workouts = await this.db
			.select({ completedAt: workoutLogs.completedAt })
			.from(workoutLogs)
			.where(eq(workoutLogs.userId, userId))
			.orderBy(desc(workoutLogs.completedAt));

		if (workouts.length === 0) return 0;

		let streak = 0;
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		for (const workout of workouts) {
			const workoutDate = new Date(workout.completedAt);
			workoutDate.setHours(0, 0, 0, 0);

			const daysDiff = Math.floor(
				(currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
				streak = Math.max(streak, daysDiff + 1);
			} else {
				break;
			}
		}

		return streak;
	}

	private toEntity(raw: typeof workoutLogs.$inferSelect): WorkoutLog {
		return new WorkoutLog(
			raw.id,
			raw.userId,
			raw.splitId,
			raw.dayId,
			raw.duration,
			raw.notes,
			raw.completedAt,
			raw.createdAt
		);
	}
}
