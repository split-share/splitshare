/**
 * Data transfer objects for Comment operations
 */

export interface CreateCommentDto {
	userId: string;
	splitId: string;
	content: string;
}

export interface UpdateCommentDto {
	content: string;
}

export interface CommentWithUserDto {
	id: string;
	userId: string;
	splitId: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	user: {
		id: string;
		name: string;
		image: string | null;
	};
}
