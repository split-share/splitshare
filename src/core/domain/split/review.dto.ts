/**
 * Data transfer objects for Review operations
 */

export interface CreateReviewDto {
	userId: string;
	splitId: string;
	rating: number;
	content: string;
}

export interface UpdateReviewDto {
	rating: number;
	content: string;
}

export interface ReviewWithUserDto {
	id: string;
	userId: string;
	splitId: string;
	rating: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
}

export interface ReviewStatsDto {
	averageRating: number;
	totalReviews: number;
	ratingDistribution: {
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
	};
}
