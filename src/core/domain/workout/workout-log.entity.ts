/**
 * WorkoutLog domain entity - tracks completed workouts
 * Records workout completion details including duration, notes, and completion time
 * Links to exercise logs that contain detailed performance data
 */
export class WorkoutLog {
	/**
	 * Creates a new WorkoutLog instance
	 * @param {string} id - Unique identifier for the workout log
	 * @param {string} userId - ID of the user who completed the workout
	 * @param {string} splitId - ID of the split that was performed
	 * @param {string} dayId - ID of the specific split day that was completed
	 * @param {number | null} duration - Total workout duration in seconds (null if not timed)
	 * @param {string | null} notes - Optional post-workout notes/reflections
	 * @param {Date} completedAt - Timestamp when the workout was completed
	 * @param {Date} createdAt - Timestamp when the log was created in the database
	 */
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public readonly dayId: string,
		public duration: number | null,
		public notes: string | null,
		public readonly completedAt: Date,
		public readonly createdAt: Date
	) {}

	/**
	 * Updates the workout notes
	 * @param {string} notes - New notes content
	 */
	updateNotes(notes: string): void {
		this.notes = notes;
	}

	/**
	 * Updates the workout duration
	 * @param {number} duration - New duration value in seconds
	 * @throws {Error} If duration is negative
	 */
	updateDuration(duration: number): void {
		if (duration < 0) {
			throw new Error('Duration must be positive');
		}
		this.duration = duration;
	}
}
