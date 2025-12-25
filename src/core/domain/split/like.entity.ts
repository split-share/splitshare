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
}
