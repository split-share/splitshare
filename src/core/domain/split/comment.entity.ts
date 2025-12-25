/**
 * Comment domain entity
 * Represents a user's comment on a split
 */
export class Comment {
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
	 */
	updateContent(newContent: string): void {
		this.content = newContent;
		this.updatedAt = new Date();
	}
}
