import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { IWorkoutLogRepository } from '../../ports/repositories/workout-log.repository.port';
import type { IPersonalRecordRepository } from '../../ports/repositories/personal-record.repository.port';
import type { WorkoutLog } from '../../domain/workout/workout-log.entity';

export interface CompleteWorkoutInput {
	sessionId: string;
	userId: string;
	notes?: string | null;
}

/**
 * Use case for completing an active workout session
 * Converts session data to a permanent workout log and updates personal records
 */
export class CompleteWorkoutSessionUseCase {
	constructor(
		private workoutSessionRepository: IWorkoutSessionRepository,
		private workoutLogRepository: IWorkoutLogRepository,
		private personalRecordRepository: IPersonalRecordRepository
	) {}

	/**
	 * Completes a workout session and creates a permanent workout log
	 * @param {CompleteWorkoutInput} input - Session completion data (sessionId, userId, notes)
	 * @returns {Promise<WorkoutLog>} The created workout log with all completed exercises
	 * @throws {Error} If session not found or not owned by user
	 */
	async execute(input: CompleteWorkoutInput): Promise<WorkoutLog> {
		// Get session with details
		const sessionData = await this.workoutSessionRepository.findActiveByUserIdWithDetails(
			input.userId
		);
		if (!sessionData || sessionData.session.id !== input.sessionId) {
			throw new Error('Session not found or not owned by user');
		}

		const { session, exercises } = sessionData;
		const startedAt = new Date(session.startedAt);
		const completedAt = new Date();
		const durationMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);

		// Group completed sets by exercise
		const setsByExercise = new Map<
			number,
			{ weight: number | null; reps: number; notes: string | null }[]
		>();
		for (const set of session.completedSets) {
			if (!setsByExercise.has(set.exerciseIndex)) {
				setsByExercise.set(set.exerciseIndex, []);
			}
			setsByExercise.get(set.exerciseIndex)!.push({
				weight: set.weight,
				reps: set.reps,
				notes: set.notes
			});
		}

		// Build exercise logs
		const exerciseLogs: {
			exerciseId: string;
			sets: number;
			reps: string;
			weight?: number | null;
			notes?: string | null;
		}[] = [];

		for (const [exerciseIndex, sets] of setsByExercise.entries()) {
			const exercise = exercises[exerciseIndex];
			if (!exercise || !exercise.exerciseId) continue;

			// Calculate average/max weight and total reps
			const weights = sets.filter((s) => s.weight !== null).map((s) => s.weight as number);
			const maxWeight = weights.length > 0 ? Math.max(...weights) : null;
			const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
			const allNotes = sets
				.map((s) => s.notes)
				.filter(Boolean)
				.join('; ');

			exerciseLogs.push({
				exerciseId: exercise.exerciseId,
				sets: sets.length,
				reps: String(totalReps),
				weight: maxWeight,
				notes: allNotes || null
			});
		}

		// Create workout log
		const workoutLog = await this.workoutLogRepository.createWithExercises({
			userId: input.userId,
			splitId: session.splitId,
			dayId: session.dayId,
			duration: durationMinutes,
			notes: input.notes ?? null,
			completedAt,
			exercises: exerciseLogs
		});

		// Update personal records
		for (const log of exerciseLogs) {
			if (log.weight != null) {
				const repsNum = parseInt(log.reps);
				if (!isNaN(repsNum)) {
					const existing = await this.personalRecordRepository.findByUserIdAndExerciseId(
						input.userId,
						log.exerciseId
					);

					const shouldUpdate =
						!existing ||
						log.weight > existing.weight ||
						(log.weight === existing.weight && repsNum > existing.reps);

					if (shouldUpdate) {
						await this.personalRecordRepository.upsert(
							input.userId,
							log.exerciseId,
							log.weight,
							repsNum,
							completedAt
						);
					}
				}
			}
		}

		// Delete active session
		await this.workoutSessionRepository.delete(input.sessionId);

		return workoutLog;
	}
}
