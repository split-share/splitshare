/**
 * ExerciseLog domain entity - tracks individual exercise performance within a workout
 * Records sets, reps, weight used, and notes for each exercise in a completed workout
 * Used for historical tracking and progress analysis
 */
export class ExerciseLog {
	/**
	 * Creates a new ExerciseLog instance
	 * @param {string} id - Unique identifier for the exercise log entry
	 * @param {string} workoutLogId - ID of the parent workout log this exercise belongs to
	 * @param {string} exerciseId - ID of the exercise that was performed
	 * @param {number} sets - Number of sets completed
	 * @param {string} reps - Repetition scheme performed (e.g., "8-12", "10", "AMRAP")
	 * @param {number | null} weight - Weight used for the exercise (null for bodyweight exercises)
	 * @param {string | null} notes - Optional notes about the exercise performance
	 * @param {Date} createdAt - Timestamp when the log entry was created
	 */
	constructor(
		public readonly id: string,
		public readonly workoutLogId: string,
		public readonly exerciseId: string,
		public sets: number,
		public reps: string,
		public weight: number | null,
		public notes: string | null,
		public readonly createdAt: Date
	) {}

	/**
	 * Validates that sets value is valid (at least 1)
	 * @param {number} sets - The sets value to validate
	 * @throws {Error} If sets is less than 1
	 */
	static validateSets(sets: number): void {
		if (sets < 1) {
			throw new Error('Sets must be at least 1');
		}
	}

	/**
	 * Validates that weight value is valid (non-negative)
	 * @param {number} weight - The weight value to validate
	 * @throws {Error} If weight is negative
	 */
	static validateWeight(weight: number): void {
		if (weight < 0) {
			throw new Error('Weight cannot be negative');
		}
	}
}
