/**
 * Forum domain DTOs
 */

export interface ForumCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string;
	order: number;
	createdAt: Date;
}

export interface ForumCategoryWithStats extends ForumCategory {
	topicCount: number;
	postCount: number;
	lastActivity?: {
		topicId: string;
		topicTitle: string;
		userName: string;
		createdAt: Date;
	};
}

export interface ForumTopicWithDetails {
	id: string;
	categoryId: string;
	userId: string;
	title: string;
	content: string;
	isPinned: boolean;
	isLocked: boolean;
	viewCount: number;
	createdAt: Date;
	updatedAt: Date;
	author: {
		id: string;
		name: string;
		image: string | null;
	};
	category: {
		id: string;
		name: string;
		slug: string;
	};
	postCount: number;
	lastPost?: {
		id: string;
		userId: string;
		userName: string;
		createdAt: Date;
	};
}

export interface ForumPostWithAuthor {
	id: string;
	topicId: string;
	userId: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	author: {
		id: string;
		name: string;
		image: string | null;
	};
}

// Input DTOs

export interface CreateTopicDto {
	categoryId: string;
	userId: string;
	title: string;
	content: string;
}

export interface UpdateTopicDto {
	title?: string;
	content?: string;
	isPinned?: boolean;
	isLocked?: boolean;
}

export interface CreatePostDto {
	topicId: string;
	userId: string;
	content: string;
}

export interface UpdatePostDto {
	content: string;
}

// Filter DTOs

export interface TopicFiltersDto {
	categoryId?: string;
	userId?: string;
	isPinned?: boolean;
	search?: string;
}

export interface PaginationDto {
	limit: number;
	offset: number;
}
