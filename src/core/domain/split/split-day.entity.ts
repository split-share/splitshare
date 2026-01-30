/**
 * SplitDay domain entity - represents a day within a workout split
 * Each day can be a workout day with exercises or a rest day
 * Days are ordered by dayNumber within their parent split
 */
export class SplitDay {
	/**
	 * Creates a new SplitDay instance
	 * @param {string} id - Unique identifier for the day
	 * @param {string} splitId - ID of the parent split this day belongs to
	 * @param {number} dayNumber - Day number within the split sequence (1-based, typically 1-7)
	 * @param {string} name - Display name for the day (e.g., "Push Day", "Rest Day")
	 * @param {boolean} isRestDay - Whether this is a rest/recovery day with no exercises
	 * @param {Date} createdAt - Timestamp when the day was created
	 * @param {Date} updatedAt - Timestamp of last day update
	 */
	constructor(
		public readonly id: string,
		public readonly splitId: string,
		public dayNumber: number,
		public name: string,
		public isRestDay: boolean,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}
}
