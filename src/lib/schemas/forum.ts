import { z } from 'zod';

// Maximum content length for forum posts (approximately 20,000 characters allows for rich text)
const MAX_CONTENT_LENGTH = 20000;

export const createTopicSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
	content: z
		.string()
		.min(1, 'Content is required')
		.max(MAX_CONTENT_LENGTH, `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`)
});

export const updateTopicSchema = createTopicSchema.partial();

export const createPostSchema = z.object({
	content: z
		.string()
		.min(1, 'Content is required')
		.max(MAX_CONTENT_LENGTH, `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`)
});

export const updatePostSchema = z.object({
	content: z
		.string()
		.min(1, 'Content is required')
		.max(MAX_CONTENT_LENGTH, `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`)
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
