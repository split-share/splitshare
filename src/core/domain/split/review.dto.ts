/**
 * Data transfer objects for Review operations
 */

/**
 * DTO for creating a new review
 */
export interface CreateReviewDto {
	/** ID of the user creating the review */
	userId: string;
	/** ID of the split being reviewed */
	splitId: string;
	/** Rating from 1-5 stars */
	rating: number;
	/** Written review content */
	content: string;
}

/**
 * DTO for updating an existing review
 */
export interface UpdateReviewDto {
	/** Updated rating from 1-5 stars */
	rating: number;
	/** Updated review content */
	content: string;
}

/**
 * Review with user information included
 * Used for displaying reviews in the UI
 */
export interface ReviewWithUserDto {
	/** Review ID */
	id: string;
	/** User ID who created the review */
	userId: string;
	/** Split ID being reviewed */
	splitId: string;
	/** Rating from 1-5 stars */
	rating: number;
	/** Review content */
	content: string;
	/** When the review was created */
	createdAt: Date;
	/** When the review was last updated */
	updatedAt: Date;
	/** User information */
	user: {
		id: string;
		name: string;
		image: string | null;
	};
}

/**
 * Aggregate statistics for reviews on a split
 */
export interface ReviewStatsDto {
	/** Average rating across all reviews (0-5) */
	averageRating: number;
	/** Total number of reviews */
	totalReviews: number;
	/** Distribution of ratings by star count */
	ratingDistribution: {
		/** Number of 1-star reviews */
		1: number;
		/** Number of 2-star reviews */
		2: number;
		/** Number of 3-star reviews */
		3: number;
		/** Number of 4-star reviews */
		4: number;
		/** Number of 5-star reviews */
		5: number;
	};
}
