import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
	activeWorkoutSessions,
	splits,
	splitDays,
	dayExercises,
	exercises
} from '$lib/server/db/schema';
import type * as schema from '$lib/server/db/schema';
import type { IWorkoutSessionRepository } from '../../../core/ports/repositories/workout-session.repository.port';
import type {
	CreateWorkoutSessionDto,
	UpdateWorkoutSessionDto,
	WorkoutSessionWithDetailsDto,
	DayExerciseDto
} from '../../../core/domain/workout/workout-session.dto';
import {
	WorkoutSession,
	type CompletedSetData
} from '../../../core/domain/workout/workout-session.entity';

export class DrizzleWorkoutSessionRepositoryAdapter implements IWorkoutSessionRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<WorkoutSession | undefined> {
		const result = await this.db
			.select()
			.from(activeWorkoutSessions)
			.where(eq(activeWorkoutSessions.id, id))
			.limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByIdWithDetails(id: string): Promise<WorkoutSessionWithDetailsDto | undefined> {
		const [session] = await this.db
			.select({
				session: activeWorkoutSessions,
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
			.from(activeWorkoutSessions)
			.innerJoin(splits, eq(activeWorkoutSessions.splitId, splits.id))
			.innerJoin(splitDays, eq(activeWorkoutSessions.dayId, splitDays.id))
			.where(eq(activeWorkoutSessions.id, id));

		if (!session) return undefined;

		const exercisesData = await this.fetchExercisesForDay(session.day.id);

		return this.toDetailsDto(session, exercisesData);
	}

	async findActiveByUserId(userId: string): Promise<WorkoutSession | undefined> {
		const result = await this.db
			.select()
			.from(activeWorkoutSessions)
			.where(eq(activeWorkoutSessions.userId, userId))
			.limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findActiveByUserIdWithDetails(
		userId: string
	): Promise<WorkoutSessionWithDetailsDto | undefined> {
		const [session] = await this.db
			.select({
				session: activeWorkoutSessions,
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
			.from(activeWorkoutSessions)
			.innerJoin(splits, eq(activeWorkoutSessions.splitId, splits.id))
			.innerJoin(splitDays, eq(activeWorkoutSessions.dayId, splitDays.id))
			.where(eq(activeWorkoutSessions.userId, userId));

		if (!session) return undefined;

		const exercisesData = await this.fetchExercisesForDay(session.day.id);

		return this.toDetailsDto(session, exercisesData);
	}

	async create(data: CreateWorkoutSessionDto): Promise<WorkoutSession> {
		const [session] = await this.db
			.insert(activeWorkoutSessions)
			.values({
				userId: data.userId,
				splitId: data.splitId,
				dayId: data.dayId,
				currentExerciseIndex: 0,
				currentSetIndex: 0,
				phase: 'exercise',
				exerciseElapsedSeconds: 0,
				restRemainingSeconds: null,
				startedAt: new Date(),
				pausedAt: null,
				lastUpdatedAt: new Date(),
				completedSets: '[]'
			})
			.returning();

		return this.toEntity(session);
	}

	async update(id: string, data: UpdateWorkoutSessionDto): Promise<WorkoutSession> {
		const updateData: Record<string, unknown> = {
			lastUpdatedAt: new Date()
		};

		if (data.currentExerciseIndex !== undefined) {
			updateData.currentExerciseIndex = data.currentExerciseIndex;
		}
		if (data.currentSetIndex !== undefined) {
			updateData.currentSetIndex = data.currentSetIndex;
		}
		if (data.phase !== undefined) {
			updateData.phase = data.phase;
		}
		if (data.exerciseElapsedSeconds !== undefined) {
			updateData.exerciseElapsedSeconds = data.exerciseElapsedSeconds;
		}
		if (data.restRemainingSeconds !== undefined) {
			updateData.restRemainingSeconds = data.restRemainingSeconds;
		}
		if (data.pausedAt !== undefined) {
			updateData.pausedAt = data.pausedAt;
		}
		if (data.completedSets !== undefined) {
			updateData.completedSets = JSON.stringify(data.completedSets);
		}

		const [updated] = await this.db
			.update(activeWorkoutSessions)
			.set(updateData)
			.where(eq(activeWorkoutSessions.id, id))
			.returning();

		return this.toEntity(updated);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(activeWorkoutSessions).where(eq(activeWorkoutSessions.id, id));
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: activeWorkoutSessions.id })
			.from(activeWorkoutSessions)
			.where(eq(activeWorkoutSessions.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: activeWorkoutSessions.id })
			.from(activeWorkoutSessions)
			.where(and(eq(activeWorkoutSessions.id, id), eq(activeWorkoutSessions.userId, userId)))
			.limit(1);
		return result.length > 0;
	}

	private async fetchExercisesForDay(dayId: string): Promise<DayExerciseDto[]> {
		const exercisesData = await this.db
			.select({
				dayExercise: dayExercises,
				exercise: exercises
			})
			.from(dayExercises)
			.leftJoin(exercises, eq(dayExercises.exerciseId, exercises.id))
			.where(eq(dayExercises.dayId, dayId))
			.orderBy(dayExercises.order);

		return exercisesData.map((item) => ({
			id: item.dayExercise.id,
			exerciseId: item.dayExercise.exerciseId,
			exerciseName: item.dayExercise.exerciseName,
			sets: item.dayExercise.sets,
			reps: item.dayExercise.reps,
			restTime: item.dayExercise.restTime,
			weight: item.dayExercise.weight,
			notes: item.dayExercise.notes,
			order: item.dayExercise.order,
			exercise: item.exercise
				? {
						id: item.exercise.id,
						name: item.exercise.name,
						description: item.exercise.description,
						muscleGroup: item.exercise.muscleGroup,
						equipmentType: item.exercise.equipmentType,
						difficulty: item.exercise.difficulty,
						imageUrl: item.exercise.imageUrl,
						gifUrl: item.exercise.gifUrl
					}
				: null
		}));
	}

	private toDetailsDto(
		session: {
			session: typeof activeWorkoutSessions.$inferSelect;
			split: { id: string; title: string };
			day: { id: string; name: string; dayNumber: number };
		},
		exercisesData: DayExerciseDto[]
	): WorkoutSessionWithDetailsDto {
		const completedSets = this.parseCompletedSets(session.session.completedSets);

		return {
			session: {
				id: session.session.id,
				userId: session.session.userId,
				splitId: session.session.splitId,
				dayId: session.session.dayId,
				currentExerciseIndex: session.session.currentExerciseIndex,
				currentSetIndex: session.session.currentSetIndex,
				phase: session.session.phase as 'exercise' | 'rest' | 'completed',
				exerciseElapsedSeconds: session.session.exerciseElapsedSeconds,
				restRemainingSeconds: session.session.restRemainingSeconds,
				startedAt: session.session.startedAt,
				pausedAt: session.session.pausedAt,
				lastUpdatedAt: session.session.lastUpdatedAt,
				completedSets,
				createdAt: session.session.createdAt
			},
			split: session.split,
			day: session.day,
			exercises: exercisesData
		};
	}

	private toEntity(raw: typeof activeWorkoutSessions.$inferSelect): WorkoutSession {
		const completedSets = this.parseCompletedSets(raw.completedSets);

		return new WorkoutSession(
			raw.id,
			raw.userId,
			raw.splitId,
			raw.dayId,
			raw.currentExerciseIndex,
			raw.currentSetIndex,
			raw.phase as 'exercise' | 'rest' | 'completed',
			raw.exerciseElapsedSeconds,
			raw.restRemainingSeconds,
			raw.startedAt,
			raw.pausedAt,
			raw.lastUpdatedAt,
			completedSets,
			raw.createdAt
		);
	}

	private parseCompletedSets(json: string): CompletedSetData[] {
		try {
			const parsed = JSON.parse(json);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
}
