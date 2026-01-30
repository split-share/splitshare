/**
 * WorkoutSession domain entity - tracks active workout sessions in real-time
 * Manages workout progression through exercises, sets, rest periods, and phase transitions
 */
export type WorkoutPhase = 'exercise' | 'rest' | 'completed';

/**
 * Data structure representing a completed set during a workout session
 */
export interface CompletedSetData {
	/** Index of the exercise in the workout sequence */
	exerciseIndex: number;
	/** Index of the set within the exercise */
	setIndex: number;
	/** Weight used for the set (null if bodyweight) */
	weight: number | null;
	/** Number of repetitions performed */
	reps: number;
	/** Optional notes about the set performance */
	notes: string | null;
	/** Timestamp when the set was completed */
	completedAt: Date;
}

/**
 * Active workout session tracking workout progress in real-time
 * Handles phase transitions, set completion, rest timers, and pause/resume functionality
 */
export class WorkoutSession {
	/**
	 * Creates a new WorkoutSession instance
	 * @param {string} id - Unique identifier for the session
	 * @param {string} userId - ID of the user performing the workout
	 * @param {string} splitId - ID of the split being performed
	 * @param {string} dayId - ID of the specific split day being performed
	 * @param {number} currentExerciseIndex - Current position in the exercise sequence (0-based)
	 * @param {number} currentSetIndex - Current set within the exercise (0-based)
	 * @param {WorkoutPhase} phase - Current phase of the workout (exercise, rest, or completed)
	 * @param {number} exerciseElapsedSeconds - Elapsed time for current exercise in seconds
	 * @param {number | null} restRemainingSeconds - Remaining rest time in seconds (null when not resting)
	 * @param {Date} startedAt - Timestamp when the workout session began
	 * @param {Date | null} pausedAt - Timestamp when session was paused (null if active)
	 * @param {Date} lastUpdatedAt - Timestamp of last state update
	 * @param {CompletedSetData[]} completedSets - Array of all completed sets during this session
	 * @param {Date} createdAt - Timestamp when session was created in database
	 */
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public readonly dayId: string,
		public currentExerciseIndex: number,
		public currentSetIndex: number,
		public phase: WorkoutPhase,
		public exerciseElapsedSeconds: number,
		public restRemainingSeconds: number | null,
		public readonly startedAt: Date,
		public pausedAt: Date | null,
		public lastUpdatedAt: Date,
		public completedSets: CompletedSetData[],
		public readonly createdAt: Date
	) {}

	/**
	 * Checks if the workout session is currently paused
	 * @returns {boolean} True if pausedAt is set, false otherwise
	 */
	isPaused(): boolean {
		return this.pausedAt !== null;
	}

	/**
	 * Calculates total elapsed time since workout started
	 * If paused, returns time up to pause point; if active, returns time up to now
	 * @returns {number} Total elapsed time in seconds
	 */
	getTotalElapsedSeconds(): number {
		if (this.pausedAt) {
			return Math.floor((this.pausedAt.getTime() - this.startedAt.getTime()) / 1000);
		}
		return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
	}

	/**
	 * Records completion of the current set with weight, reps, and notes
	 * Adds the completed set data to the session history
	 * @param {number | null} weight - Weight used for the set (null for bodyweight)
	 * @param {number} reps - Number of repetitions completed
	 * @param {string | null} notes - Optional notes about the set
	 */
	completeSet(weight: number | null, reps: number, notes: string | null): void {
		this.completedSets.push({
			exerciseIndex: this.currentExerciseIndex,
			setIndex: this.currentSetIndex,
			weight,
			reps,
			notes,
			completedAt: new Date()
		});
	}

	/**
	 * Transitions the session into rest phase after completing a set
	 * Resets exercise timer and sets rest countdown
	 * @param {number} restTimeSeconds - Duration of rest period in seconds
	 */
	startRestPhase(restTimeSeconds: number): void {
		this.phase = 'rest';
		this.restRemainingSeconds = restTimeSeconds;
		this.exerciseElapsedSeconds = 0;
	}

	/**
	 * Advances to the next set within the current exercise
	 * Transitions from rest phase back to exercise phase
	 */
	startNextSet(): void {
		this.currentSetIndex++;
		this.phase = 'exercise';
		this.exerciseElapsedSeconds = 0;
		this.restRemainingSeconds = null;
	}

	/**
	 * Advances to the first set of the next exercise in the sequence
	 * Resets set index and exercise timer, clears rest timer
	 */
	startNextExercise(): void {
		this.currentExerciseIndex++;
		this.currentSetIndex = 0;
		this.phase = 'exercise';
		this.exerciseElapsedSeconds = 0;
		this.restRemainingSeconds = null;
	}

	/**
	 * Marks the entire workout session as completed
	 * Sets phase to 'completed' to indicate workout is finished
	 */
	complete(): void {
		this.phase = 'completed';
	}

	/**
	 * Pauses the workout session, recording the pause timestamp
	 * Stops all timers and prevents further progress tracking
	 */
	pause(): void {
		this.pausedAt = new Date();
	}

	/**
	 * Resumes a paused workout session
	 * Clears pause timestamp and updates lastUpdatedAt to track resumed state
	 */
	resume(): void {
		this.pausedAt = null;
		this.lastUpdatedAt = new Date();
	}
}
