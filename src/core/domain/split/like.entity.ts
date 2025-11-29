/**
 * Like domain entity
 * Represents a user's like on a split
 */
export class Like {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public readonly createdAt: Date
	) {}

	/**
	 * Validates that userId is not empty
	 */
	static validateUserId(userId: string): void {
		if (!userId || !userId.trim()) {
			throw new Error('User ID is required');
		}
	}

	/**
	 * Validates that splitId is not empty
	 */
	static validateSplitId(splitId: string): void {
		if (!splitId || !splitId.trim()) {
			throw new Error('Split ID is required');
		}
	}
}
