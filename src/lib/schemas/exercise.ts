import { z } from 'zod';

// Define as mutable arrays for z.enum
const MUSCLE_GROUPS = [
	'Chest',
	'Back',
	'Shoulders',
	'Biceps',
	'Triceps',
	'Legs',
	'Quads',
	'Hamstrings',
	'Calves',
	'Glutes',
	'Core',
	'Abs',
	'Cardio',
	'Full Body'
] as const;

const EQUIPMENT_TYPES = [
	'Barbell',
	'Dumbbell',
	'Kettlebell',
	'Machine',
	'Cable',
	'Bodyweight',
	'Resistance Band',
	'Medicine Ball',
	'TRX',
	'Other'
] as const;

export const createExerciseSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
	description: z.string().max(500, 'Description is too long').optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
	muscleGroup: z.enum(MUSCLE_GROUPS, {
		errorMap: () => ({ message: 'Invalid muscle group' })
	}),
	equipmentType: z.enum(EQUIPMENT_TYPES, {
		errorMap: () => ({ message: 'Invalid equipment type' })
	}),
	// Image URL (external URL, e.g., from Unsplash, Pexels, or Supabase Storage)
	imageUrl: z.string().url('Invalid image URL').optional(),
	// Video URL (YouTube URL, e.g., https://www.youtube.com/watch?v=VIDEO_ID)
	videoUrl: z
		.string()
		.url('Invalid video URL')
		.refine((url) => url.includes('youtube.com') || url.includes('youtu.be'), {
			message: 'Video must be a YouTube URL'
		})
		.optional()
});

export const updateExerciseSchema = createExerciseSchema.partial();

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
