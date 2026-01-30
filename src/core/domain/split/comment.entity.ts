/**
 * Comment domain entity
 * Represents a user's comment on a split
 * Allows users to leave feedback and discuss splits
 */
export class Comment {
	/**
	 * Creates a new Comment instance
	 * @param {string} id - Unique identifier for the comment
	 * @param {string} userId - ID of the user who wrote the comment
	 * @param {string} splitId - ID of the split being commented on
	 * @param {string} content - The comment text content
	 * @param {Date} createdAt - Timestamp when the comment was created
	 * @param {Date} updatedAt - Timestamp of last comment update
	 */
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public content: string,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	/**
	 * Updates the comment content
	 * Automatically updates the updatedAt timestamp
	 * @param {string} newContent - The new comment content
	 */
	updateContent(newContent: string): void {
		this.content = newContent;
		this.updatedAt = new Date();
	}
}
