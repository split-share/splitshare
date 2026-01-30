/**
 * WeightEntry domain entity - tracks user body weight measurements over time
 * Allows users to log weight entries with optional notes for tracking progress
 * Supports updates to weight, recorded date, and notes
 */
export class WeightEntry {
	/**
	 * Creates a new WeightEntry instance
	 * @param {string} id - Unique identifier for the weight entry
	 * @param {string} userId - ID of the user who recorded this weight
	 * @param {number} weight - Weight value in the user's preferred unit (kg or lbs)
	 * @param {Date} recordedAt - Date and time when the weight was recorded
	 * @param {string | null} notes - Optional notes about the weight entry (e.g., context, conditions)
	 * @param {Date} createdAt - Timestamp when the entry was created in the database
	 * @param {Date} updatedAt - Timestamp of last update to this entry
	 */
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public weight: number,
		public recordedAt: Date,
		public notes: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	/**
	 * Updates the weight entry with new data
	 * Only updates fields that are explicitly provided (undefined fields are skipped)
	 * Automatically updates the updatedAt timestamp
	 * @param {Object} data - Partial update data
	 * @param {number} [data.weight] - New weight value
	 * @param {Date} [data.recordedAt] - New recorded date/time
	 * @param {string | null} [data.notes] - New notes (null to clear existing notes)
	 */
	update(data: { weight?: number; recordedAt?: Date; notes?: string | null }): void {
		if (data.weight !== undefined) this.weight = data.weight;
		if (data.recordedAt !== undefined) this.recordedAt = data.recordedAt;
		if (data.notes !== undefined) this.notes = data.notes;
		this.updatedAt = new Date();
	}
}
