/**
 * Like domain entity
 * Represents a user's like on a split
 * Simple junction entity connecting users to splits they have liked
 */
export class Like {
	/**
	 * Creates a new Like instance
	 * @param {string} id - Unique identifier for the like
	 * @param {string} userId - ID of the user who liked the split
	 * @param {string} splitId - ID of the split that was liked
	 * @param {Date} createdAt - Timestamp when the like was created
	 */
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public readonly createdAt: Date
	) {}
}
