import type { IWorkoutSessionRepository } from '../../ports/repositories/workout-session.repository.port';
import type { WorkoutSessionWithDetailsDto } from '../../domain/workout/workout-session.dto';
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

		const isLastSet = session.currentSetIndex >= currentExercise.sets - 1;
		const isLastExercise = session.currentExerciseIndex >= exercises.length - 1;

		let newPhase = session.phase;
		let newExerciseIndex = session.currentExerciseIndex;
		let newSetIndex = session.currentSetIndex;
		let newRestRemainingSeconds: number | null = null;

		if (isLastSet && isLastExercise) {
			// Workout complete
			newPhase = 'completed';
		} else if (isLastSet) {
			// Move to next exercise, start rest
			newPhase = 'rest';
			newRestRemainingSeconds = currentExercise.restTime || 60; // Default 60s rest
			newExerciseIndex = session.currentExerciseIndex + 1;
			newSetIndex = 0;
		} else {
			// Same exercise, next set, start rest
			newPhase = 'rest';
			newRestRemainingSeconds = currentExercise.restTime || 60;
			newSetIndex = session.currentSetIndex + 1;
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
}
