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
