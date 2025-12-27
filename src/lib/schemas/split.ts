import { z } from 'zod';
import { POPULAR_EXERCISES } from '$lib/constants';

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
	exerciseId: z.string().uuid().optional(), // Optional: reference to structured exercise
	exerciseName: z
		.string()
		.min(1, 'Exercise name is required')
		.max(100, 'Exercise name is too long')
		.refine(
			(name) => POPULAR_EXERCISES.some((ex) => ex.name === name),
			'Exercise must be selected from the predefined list'
		),
	sets: z.number().int().min(1, 'Sets must be at least 1').max(20, 'Max 20 sets'),
	reps: z.string().min(1, 'Reps are required'), // Can be "10" or "8-12" or "AMRAP"
	restTime: z.number().int().min(0).max(600, 'Max rest time is 10 minutes').optional(),
	order: z.number().int().min(0),
	notes: z.string().max(200, 'Notes are too long').optional(),
	weight: z
		.number()
		.positive('Weight must be positive')
		.max(1000, 'Weight exceeds maximum (1000kg)')
		.optional()
});

// Schema for creating a split day
export const createSplitDaySchema = z.object({
	dayNumber: z.number().int().min(1),
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
	days: z.array(createSplitDaySchema).min(1, 'Split must have at least one day')
});

export const commentSchema = z.object({
	content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long')
});

export const workoutLogSchema = z.object({
	splitId: z.string().uuid(),
	duration: z.number().int().min(1).max(600).optional(),
	notes: z.string().max(500).optional()
});

// Schema for logging a completed workout
const logExerciseSchema = z.object({
	exerciseId: z.string().uuid('Invalid exercise ID'),
	sets: z.coerce.number().int().min(1, 'Sets must be at least 1').max(100, 'Sets exceeds maximum'),
	reps: z.string().min(1, 'Reps are required'),
	weight: z.coerce.number().positive().max(2000, 'Weight exceeds maximum').nullable().optional(),
	notes: z.string().max(500, 'Notes too long').nullable().optional()
});

export const logWorkoutSchema = z.object({
	splitId: z.string().uuid('Invalid split ID'),
	dayId: z.string().uuid('Invalid day ID'),
	duration: z.coerce
		.number()
		.int()
		.min(1)
		.max(1440, 'Duration exceeds 24 hours')
		.nullable()
		.optional(),
	notes: z.string().max(1000, 'Notes too long').nullable().optional(),
	exercises: z.array(logExerciseSchema).min(1, 'At least one exercise is required')
});

export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;

// Schema for workout session sync API
export const workoutSyncSchema = z.object({
	sessionId: z.string().uuid('Invalid session ID'),
	exerciseElapsedSeconds: z
		.number()
		.int()
		.min(0, 'Elapsed seconds cannot be negative')
		.max(86400, 'Elapsed seconds exceeds 24 hours')
		.optional(),
	restRemainingSeconds: z
		.number()
		.int()
		.min(0, 'Rest seconds cannot be negative')
		.max(3600, 'Rest seconds exceeds 1 hour')
		.optional(),
	pausedAt: z.string().datetime().nullable().optional()
});

export type CreateSplitInput = z.infer<typeof createSplitSchema>;
export type UpdateSplitInput = z.infer<typeof updateSplitSchema>;
export type AddExerciseToDayInput = z.infer<typeof addExerciseToDaySchema>;
export type CreateSplitDayInput = z.infer<typeof createSplitDaySchema>;
export type CreateCompleteSplitInput = z.infer<typeof createCompleteSplitSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type WorkoutSyncInput = z.infer<typeof workoutSyncSchema>;
