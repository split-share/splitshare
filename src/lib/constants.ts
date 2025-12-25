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
	{ name: 'Bench Press', muscleGroup: 'Chest' },
	{ name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
	{ name: 'Cable Flyes', muscleGroup: 'Chest' },
	{ name: 'Push-Ups', muscleGroup: 'Chest' },
	{ name: 'Dumbbell Chest Press', muscleGroup: 'Chest' },

	// Back (5)
	{ name: 'Pull-Ups', muscleGroup: 'Back' },
	{ name: 'Barbell Rows', muscleGroup: 'Back' },
	{ name: 'Lat Pulldown', muscleGroup: 'Back' },
	{ name: 'Dumbbell Rows', muscleGroup: 'Back' },
	{ name: 'Deadlift', muscleGroup: 'Back' },

	// Shoulders (4)
	{ name: 'Overhead Press', muscleGroup: 'Shoulders' },
	{ name: 'Dumbbell Lateral Raises', muscleGroup: 'Shoulders' },
	{ name: 'Face Pulls', muscleGroup: 'Shoulders' },
	{ name: 'Arnold Press', muscleGroup: 'Shoulders' },

	// Biceps (2)
	{ name: 'Barbell Curls', muscleGroup: 'Biceps' },
	{ name: 'Hammer Curls', muscleGroup: 'Biceps' },

	// Triceps (2)
	{ name: 'Tricep Dips', muscleGroup: 'Triceps' },
	{ name: 'Overhead Tricep Extension', muscleGroup: 'Triceps' },

	// Legs (7)
	{ name: 'Barbell Squats', muscleGroup: 'Legs' },
	{ name: 'Romanian Deadlift', muscleGroup: 'Legs' },
	{ name: 'Leg Press', muscleGroup: 'Legs' },
	{ name: 'Lunges', muscleGroup: 'Legs' },
	{ name: 'Leg Curls', muscleGroup: 'Legs' },
	{ name: 'Leg Extensions', muscleGroup: 'Legs' },
	{ name: 'Calf Raises', muscleGroup: 'Legs' },

	// Core (5)
	{ name: 'Planks', muscleGroup: 'Core' },
	{ name: 'Hanging Leg Raises', muscleGroup: 'Core' },
	{ name: 'Cable Crunches', muscleGroup: 'Core' },
	{ name: 'Russian Twists', muscleGroup: 'Core' },
	{ name: 'Ab Wheel Rollouts', muscleGroup: 'Core' }
] as const;
