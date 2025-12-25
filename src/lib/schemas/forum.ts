import { z } from 'zod';

export const createTopicSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
	content: z.string().min(1, 'Content is required')
});

export const updateTopicSchema = createTopicSchema.partial();

export const createPostSchema = z.object({
	content: z.string().min(1, 'Content is required')
});

export const updatePostSchema = z.object({
	content: z.string().min(1, 'Content is required')
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
