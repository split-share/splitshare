import { z } from 'zod';

export const createSplitSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
	description: z.string().max(500, 'Description is too long').optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
	duration: z.number().int().min(1).max(300).optional(),
	isPublic: z.boolean().default(false),
	tags: z.array(z.string()).max(10).optional(),
	imageUrl: z.string().url().optional()
});

export const updateSplitSchema = createSplitSchema.partial();

export const addExerciseToSplitSchema = z.object({
	exerciseId: z.string().uuid(),
	sets: z.number().int().min(1).max(20),
	reps: z.string().min(1), // Can be "10" or "8-12" or "AMRAP"
	restTime: z.number().int().min(0).max(600).optional(),
	order: z.number().int().min(0),
	notes: z.string().max(200).optional()
});

export const commentSchema = z.object({
	content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long')
});

export const workoutLogSchema = z.object({
	splitId: z.string().uuid(),
	duration: z.number().int().min(1).max(600).optional(),
	notes: z.string().max(500).optional()
});

export type CreateSplitInput = z.infer<typeof createSplitSchema>;
export type UpdateSplitInput = z.infer<typeof updateSplitSchema>;
export type AddExerciseToSplitInput = z.infer<typeof addExerciseToSplitSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
