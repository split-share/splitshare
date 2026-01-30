/**
 * DayExercise domain entity - junction between split day and exercise
 * Represents an exercise assigned to a specific day in a workout split
 * Includes set/rep configuration, rest time, ordering, and grouping capabilities
 */

/**
 * Type of exercise grouping for supersets or trisets
 */
export type ExerciseGroupType = 'superset' | 'triset';

/**
 * Junction entity linking an exercise to a specific split day
 * Configures how the exercise should be performed (sets, reps, rest, order)
 * Supports grouping exercises into supersets or trisets
 */
export class DayExercise {
	/**
	 * Creates a new DayExercise instance
	 * @param {string} id - Unique identifier for the day-exercise mapping
	 * @param {string} dayId - ID of the split day this exercise belongs to
	 * @param {string} exerciseId - ID of the exercise being assigned
	 * @param {number} sets - Number of sets to perform
	 * @param {string} reps - Repetition scheme (e.g., "8-12", "10", "AMRAP")
	 * @param {number | null} restTime - Rest time between sets in seconds (null for default)
	 * @param {number} order - Display order within the day (0-based, for sorting)
	 * @param {string | null} notes - Optional notes for this exercise assignment
	 * @param {number | null} weight - Default/suggested weight (null for bodyweight or variable)
	 * @param {string | null} groupId - ID linking exercises in a superset/triset group
	 * @param {ExerciseGroupType | null} groupType - Type of grouping (superset/triset) if grouped
	 * @param {Date} createdAt - Timestamp when the mapping was created
	 */
	constructor(
		public readonly id: string,
		public readonly dayId: string,
		public readonly exerciseId: string,
		public sets: number,
		public reps: string,
		public restTime: number | null,
		public order: number,
		public notes: string | null,
		public weight: number | null,
		public groupId: string | null,
		public groupType: ExerciseGroupType | null,
		public readonly createdAt: Date
	) {}

	/**
	 * Checks if this exercise is part of a superset or triset group
	 * @returns {boolean} True if groupId is set, false otherwise
	 */
	isGrouped(): boolean {
		return this.groupId !== null;
	}
}
