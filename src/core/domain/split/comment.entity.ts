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
		Comment.validateContent(newContent);
		this.content = newContent;
		this.updatedAt = new Date();
	}

	/**
	 * Validates that content is not empty and within length limits
	 */
	static validateContent(content: string): void {
		if (!content || !content.trim()) {
			throw new Error('Comment content is required');
		}
		if (content.length > 1000) {
			throw new Error('Comment content must be less than 1000 characters');
		}
	}

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
