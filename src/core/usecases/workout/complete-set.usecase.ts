import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type {
	WorkoutSessionWithDetailsDto,
	DayExerciseDto
} from '../../domain/workout/workout-session.dto';
import type { CompletedSetData } from '../../domain/workout/workout-session.entity';

export interface CompleteSetInput {
	sessionId: string;
	userId: string;
	weight: number | null;
	reps: number;
	notes: string | null;
}

export class CompleteSetUseCase {
	constructor(private workoutSessionRepository: IWorkoutSessionRepository) {}

	async execute(input: CompleteSetInput): Promise<WorkoutSessionWithDetailsDto> {
		// Get session with details
		const sessionData = await this.workoutSessionRepository.findActiveByUserIdWithDetails(
			input.userId
		);
		if (!sessionData || sessionData.session.id !== input.sessionId) {
			throw new Error('Session not found or not owned by user');
		}

		const { session, exercises } = sessionData;
		const currentExercise = exercises[session.currentExerciseIndex];

		if (!currentExercise) {
			throw new Error('Invalid exercise index');
		}

		// Add completed set
		const completedSet: CompletedSetData = {
			exerciseIndex: session.currentExerciseIndex,
			setIndex: session.currentSetIndex,
			weight: input.weight,
			reps: input.reps,
			notes: input.notes,
			completedAt: new Date()
		};

		const updatedCompletedSets = [...session.completedSets, completedSet];

		// Check if this exercise is part of a superset/triset
		const isGrouped = currentExercise.groupId !== null;

		let newPhase = session.phase;
		let newExerciseIndex = session.currentExerciseIndex;
		let newSetIndex = session.currentSetIndex;
		let newRestRemainingSeconds: number | null = null;

		if (isGrouped) {
			// Handle superset/triset logic
			const result = this.handleGroupedExercise(
				exercises,
				currentExercise,
				session.currentExerciseIndex,
				session.currentSetIndex
			);
			newPhase = result.phase;
			newExerciseIndex = result.exerciseIndex;
			newSetIndex = result.setIndex;
			newRestRemainingSeconds = result.restRemainingSeconds;
		} else {
			// Handle standalone exercise (original logic)
			const isLastSet = session.currentSetIndex >= currentExercise.sets - 1;
			const isLastExercise = session.currentExerciseIndex >= exercises.length - 1;

			if (isLastSet && isLastExercise) {
				// Workout complete
				newPhase = 'completed';
			} else if (isLastSet) {
				// Move to next exercise, start rest
				newPhase = 'rest';
				newRestRemainingSeconds = currentExercise.restTime || 60;
				newExerciseIndex = session.currentExerciseIndex + 1;
				newSetIndex = 0;
			} else {
				// Same exercise, next set, start rest
				newPhase = 'rest';
				newRestRemainingSeconds = currentExercise.restTime || 60;
				newSetIndex = session.currentSetIndex + 1;
			}
		}

		await this.workoutSessionRepository.update(input.sessionId, {
			phase: newPhase,
			currentExerciseIndex: newExerciseIndex,
			currentSetIndex: newSetIndex,
			restRemainingSeconds: newRestRemainingSeconds,
			exerciseElapsedSeconds: 0,
			completedSets: updatedCompletedSets
		});

		// Return updated session
		return (await this.workoutSessionRepository.findActiveByUserIdWithDetails(input.userId))!;
	}

	/**
	 * Handle progression logic for grouped exercises (supersets/trisets)
	 */
	private handleGroupedExercise(
		exercises: DayExerciseDto[],
		currentExercise: DayExerciseDto,
		currentExerciseIndex: number,
		currentSetIndex: number
	): {
		phase: 'exercise' | 'rest' | 'completed';
		exerciseIndex: number;
		setIndex: number;
		restRemainingSeconds: number | null;
	} {
		const groupId = currentExercise.groupId!;

		// Find all exercises in this group and their indices
		const groupExercisesWithIndices = exercises
			.map((ex, idx) => ({ exercise: ex, index: idx }))
			.filter((item) => item.exercise.groupId === groupId);

		// Find current position in group
		const currentPositionInGroup = groupExercisesWithIndices.findIndex(
			(item) => item.index === currentExerciseIndex
		);
		const isLastInGroup = currentPositionInGroup === groupExercisesWithIndices.length - 1;

		// Get the max sets across all exercises in the group
		const maxSetsInGroup = Math.max(...groupExercisesWithIndices.map((item) => item.exercise.sets));
		const isLastSet = currentSetIndex >= maxSetsInGroup - 1;

		// Check if this is the last exercise/group overall
		const lastGroupExerciseIndex =
			groupExercisesWithIndices[groupExercisesWithIndices.length - 1].index;
		const nextNonGroupExerciseIndex = exercises.findIndex(
			(ex, idx) => idx > lastGroupExerciseIndex && ex.groupId !== groupId
		);
		const hasMoreExercisesAfterGroup = nextNonGroupExerciseIndex !== -1;

		if (!isLastInGroup) {
			// Move to next exercise in group immediately (no rest)
			const nextInGroup = groupExercisesWithIndices[currentPositionInGroup + 1];
			return {
				phase: 'exercise',
				exerciseIndex: nextInGroup.index,
				setIndex: currentSetIndex, // Same set number
				restRemainingSeconds: null
			};
		}

		// We're at the last exercise in the group
		if (isLastSet) {
			// All sets in group complete
			if (!hasMoreExercisesAfterGroup) {
				// Workout complete
				return {
					phase: 'completed',
					exerciseIndex: currentExerciseIndex,
					setIndex: currentSetIndex,
					restRemainingSeconds: null
				};
			} else {
				// Move to next exercise/group with rest
				return {
					phase: 'rest',
					exerciseIndex: nextNonGroupExerciseIndex,
					setIndex: 0,
					restRemainingSeconds: this.getGroupRestTime(groupExercisesWithIndices)
				};
			}
		} else {
			// More sets to do - return to first exercise in group after rest
			const firstInGroup = groupExercisesWithIndices[0];
			return {
				phase: 'rest',
				exerciseIndex: firstInGroup.index,
				setIndex: currentSetIndex + 1, // Next set round
				restRemainingSeconds: this.getGroupRestTime(groupExercisesWithIndices)
			};
		}
	}

	/**
	 * Get the rest time for a group (use max rest time from exercises in group)
	 */
	private getGroupRestTime(
		groupExercises: Array<{ exercise: DayExerciseDto; index: number }>
	): number {
		const restTimes = groupExercises
			.map((item) => item.exercise.restTime)
			.filter((time): time is number => time !== null);

		return restTimes.length > 0 ? Math.max(...restTimes) : 60;
	}
}
