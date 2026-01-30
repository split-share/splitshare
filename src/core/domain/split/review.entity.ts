/**
 * Review domain entity
 * Represents a user's rating and review on a split
 * Contains business rules for rating validation and review updates
 */
export class Review {
	/**
	 * Creates a new Review instance
	 * @param {string} id - Unique identifier for the review
	 * @param {string} userId - ID of the user who wrote the review
	 * @param {string} splitId - ID of the split being reviewed
	 * @param {number} rating - Rating from 1 to 5 stars
	 * @param {string} content - Review text content
	 * @param {Date} createdAt - Timestamp when review was created
	 * @param {Date} updatedAt - Timestamp of last review update
	 * @throws {Error} If rating is not between 1 and 5
	 */
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
	 * @param {number} rating - The rating value to validate
	 * @throws {Error} If rating is less than 1 or greater than 5
	 */
	private validateRating(rating: number): void {
		if (rating < 1 || rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}
	}

	/**
	 * Updates the review content and rating
	 * Validates the new rating before updating
	 * @param {number} rating - New rating value (1-5)
	 * @param {string} content - New review content
	 * @throws {Error} If rating is not between 1 and 5
	 */
	update(rating: number, content: string): void {
		this.validateRating(rating);
		this.rating = rating;
		this.content = content;
		this.updatedAt = new Date();
	}
}
