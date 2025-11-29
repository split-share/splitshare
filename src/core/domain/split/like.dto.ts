/**
 * Data transfer objects for Like operations
 */

export interface CreateLikeDto {
	userId: string;
	splitId: string;
}

export interface LikeWithUserDto {
	id: string;
	userId: string;
	splitId: string;
	createdAt: Date;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
}
