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

// Schema for adding an exercise to a specific day
export const addExerciseToDaySchema = z.object({
	exerciseId: z.string().uuid(),
	sets: z.number().int().min(1, 'Sets must be at least 1').max(20, 'Max 20 sets'),
	reps: z.string().min(1, 'Reps are required'), // Can be "10" or "8-12" or "AMRAP"
	restTime: z.number().int().min(0).max(600, 'Max rest time is 10 minutes').optional(),
	order: z.number().int().min(0),
	notes: z.string().max(200, 'Notes are too long').optional()
});

// Schema for creating a split day
export const createSplitDaySchema = z.object({
	dayNumber: z.number().int().min(1, 'Day must be 1-7').max(7, 'Day must be 1-7'),
	name: z.string().min(1, 'Day name is required').max(50, 'Day name is too long'),
	isRestDay: z.boolean().default(false),
	exercises: z.array(addExerciseToDaySchema).default([])
});

// Schema for creating a complete split with days and exercises
export const createCompleteSplitSchema = z.object({
	// Basic split info
	title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
	description: z.string().max(500, 'Description is too long').optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
	duration: z.number().int().min(1).max(300).optional(),
	isPublic: z.boolean().default(false),
	tags: z.array(z.string()).max(10).optional(),
	imageUrl: z.string().url().optional(),
	// Days with exercises
	days: z
		.array(createSplitDaySchema)
		.min(1, 'Split must have at least one day')
		.max(7, 'Split can have maximum 7 days')
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
export type AddExerciseToDayInput = z.infer<typeof addExerciseToDaySchema>;
export type CreateSplitDayInput = z.infer<typeof createSplitDaySchema>;
export type CreateCompleteSplitInput = z.infer<typeof createCompleteSplitSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
