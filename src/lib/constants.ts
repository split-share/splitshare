// Days of the week
export const DAYS_OF_WEEK = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const;

// Workout difficulty levels
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

// Muscle groups
export const MUSCLE_GROUPS = [
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

// Equipment types
export const EQUIPMENT_TYPES = [
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

// Workout tags/categories
export const WORKOUT_TAGS = [
	'Strength',
	'Hypertrophy',
	'Powerlifting',
	'Bodybuilding',
	'CrossFit',
	'Calisthenics',
	'Cardio',
	'HIIT',
	'Push',
	'Pull',
	'Legs',
	'Upper Body',
	'Lower Body',
	'Full Body',
	'Split',
	'PPL',
	'Bro Split'
] as const;

// Pagination
export const ITEMS_PER_PAGE = 12;

// Image upload
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Video upload
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Session duration
export const SESSION_DURATION_DAYS = 7;

// Popular exercises organized by muscle group
export const POPULAR_EXERCISES = [
	// Chest (5)
	{ name: 'Bench Press', muscleGroup: 'Chest', gifUrl: '/exercises/bench-press.gif' },
	{
		name: 'Incline Dumbbell Press',
		muscleGroup: 'Chest',
		gifUrl: '/exercises/incline-dumbbell-press.gif'
	},
	{ name: 'Cable Flyes', muscleGroup: 'Chest', gifUrl: '/exercises/cable-flyes.gif' },
	{ name: 'Push-Ups', muscleGroup: 'Chest', gifUrl: '/exercises/push-ups.gif' },
	{
		name: 'Dumbbell Chest Press',
		muscleGroup: 'Chest',
		gifUrl: '/exercises/dumbbell-chest-press.gif'
	},

	// Back (5)
	{ name: 'Pull-Ups', muscleGroup: 'Back', gifUrl: '/exercises/pull-ups.gif' },
	{ name: 'Barbell Rows', muscleGroup: 'Back', gifUrl: '/exercises/barbell-rows.gif' },
	{ name: 'Lat Pulldown', muscleGroup: 'Back', gifUrl: '/exercises/lat-pulldown.gif' },
	{ name: 'Dumbbell Rows', muscleGroup: 'Back', gifUrl: '/exercises/dumbbell-rows.gif' },
	{ name: 'Deadlift', muscleGroup: 'Back', gifUrl: '/exercises/deadlift.gif' },

	// Shoulders (4)
	{ name: 'Overhead Press', muscleGroup: 'Shoulders', gifUrl: '/exercises/overhead-press.gif' },
	{
		name: 'Dumbbell Lateral Raises',
		muscleGroup: 'Shoulders',
		gifUrl: '/exercises/dumbbell-lateral-raises.gif'
	},
	{ name: 'Face Pulls', muscleGroup: 'Shoulders', gifUrl: '/exercises/face-pulls.gif' },
	{ name: 'Arnold Press', muscleGroup: 'Shoulders', gifUrl: '/exercises/arnold-press.gif' },

	// Biceps (2)
	{ name: 'Barbell Curls', muscleGroup: 'Biceps', gifUrl: '/exercises/barbell-curls.gif' },
	{ name: 'Hammer Curls', muscleGroup: 'Biceps', gifUrl: '/exercises/hammer-curls.gif' },

	// Triceps (2)
	{ name: 'Tricep Dips', muscleGroup: 'Triceps', gifUrl: '/exercises/tricep-dips.gif' },
	{
		name: 'Overhead Tricep Extension',
		muscleGroup: 'Triceps',
		gifUrl: '/exercises/overhead-tricep-extension.gif'
	},

	// Legs (7)
	{ name: 'Barbell Squats', muscleGroup: 'Legs', gifUrl: '/exercises/barbell-squats.gif' },
	{ name: 'Romanian Deadlift', muscleGroup: 'Legs', gifUrl: '/exercises/romanian-deadlift.gif' },
	{ name: 'Leg Press', muscleGroup: 'Legs', gifUrl: '/exercises/leg-press.gif' },
	{ name: 'Lunges', muscleGroup: 'Legs', gifUrl: '/exercises/lunges.gif' },
	{ name: 'Leg Curls', muscleGroup: 'Legs', gifUrl: '/exercises/leg-curls.gif' },
	{ name: 'Leg Extensions', muscleGroup: 'Legs', gifUrl: '/exercises/leg-extensions.gif' },
	{ name: 'Calf Raises', muscleGroup: 'Legs', gifUrl: '/exercises/calf-raises.gif' },

	// Core (5)
	{ name: 'Planks', muscleGroup: 'Core', gifUrl: '/exercises/planks.gif' },
	{
		name: 'Hanging Leg Raises',
		muscleGroup: 'Core',
		gifUrl: '/exercises/hanging-leg-raises.gif'
	},
	{ name: 'Cable Crunches', muscleGroup: 'Core', gifUrl: '/exercises/cable-crunches.gif' },
	{ name: 'Russian Twists', muscleGroup: 'Core', gifUrl: '/exercises/russian-twists.gif' },
	{ name: 'Ab Wheel Rollouts', muscleGroup: 'Core', gifUrl: '/exercises/ab-wheel-rollouts.gif' }
] as const;

// Helper function to get GIF URL for an exercise by name
export function getExerciseGifUrl(exerciseName: string): string | undefined {
	const exercise = POPULAR_EXERCISES.find(
		(e) => e.name.toLowerCase() === exerciseName.toLowerCase()
	);
	return exercise?.gifUrl;
}
