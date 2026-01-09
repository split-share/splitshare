/**
 * Review domain entity
 * Represents a user's rating and review on a split
 */
export class Review {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public rating: number,
		public content: string,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {
		this.validateRating(rating);
	}

	/**
	 * Validates that rating is between 1 and 5
	 */
	private validateRating(rating: number): void {
		if (rating < 1 || rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}
	}

	/**
	 * Updates the review content and rating
	 */
	update(rating: number, content: string): void {
		this.validateRating(rating);
		this.rating = rating;
		this.content = content;
		this.updatedAt = new Date();
	}
}
