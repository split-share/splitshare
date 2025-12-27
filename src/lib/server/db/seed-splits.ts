import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { user, splits, splitDays, dayExercises } from './schema';
import { eq } from 'drizzle-orm';

const SYSTEM_USER_ID = 'system-splitshare';
const SYSTEM_USER_EMAIL = 'system@splitshare.app';

interface ExerciseData {
	name: string;
	sets: number;
	reps: string;
	restTime?: number;
	notes?: string;
}

interface DayData {
	name: string;
	isRestDay: boolean;
	exercises: ExerciseData[];
}

interface SplitData {
	title: string;
	description: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	duration: number;
	tags: string[];
	days: DayData[];
}

const defaultSplits: SplitData[] = [
	{
		title: 'Push Pull Legs (PPL)',
		description:
			'A popular 6-day split that divides workouts by movement patterns. Push days target chest, shoulders, and triceps. Pull days focus on back and biceps. Leg days hit quads, hamstrings, and calves. Great for intermediate to advanced lifters looking for high frequency training.',
		difficulty: 'intermediate',
		duration: 60,
		tags: ['hypertrophy', 'strength', '6-day', 'popular'],
		days: [
			{
				name: 'Push A',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Bench Press', sets: 4, reps: '6-8', restTime: 180 },
					{ name: 'Overhead Press', sets: 3, reps: '8-10', restTime: 120 },
					{ name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Cable Lateral Raises', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Tricep Pushdowns', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Pull A',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Rows', sets: 4, reps: '6-8', restTime: 180 },
					{ name: 'Pull-ups', sets: 3, reps: '8-10', restTime: 120, notes: 'Add weight if needed' },
					{ name: 'Seated Cable Rows', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Face Pulls', sets: 3, reps: '15-20', restTime: 60 },
					{ name: 'Barbell Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Hammer Curls', sets: 3, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Legs A',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Squats', sets: 4, reps: '6-8', restTime: 180 },
					{ name: 'Romanian Deadlifts', sets: 3, reps: '8-10', restTime: 120 },
					{ name: 'Leg Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Leg Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Calf Raises', sets: 4, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Push B',
				isRestDay: false,
				exercises: [
					{ name: 'Overhead Press', sets: 4, reps: '6-8', restTime: 180 },
					{ name: 'Incline Barbell Press', sets: 3, reps: '8-10', restTime: 120 },
					{ name: 'Dumbbell Flyes', sets: 3, reps: '12-15', restTime: 90 },
					{ name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Close Grip Bench Press', sets: 3, reps: '8-10', restTime: 90 },
					{ name: 'Skull Crushers', sets: 3, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Pull B',
				isRestDay: false,
				exercises: [
					{ name: 'Deadlifts', sets: 4, reps: '5', restTime: 240, notes: 'Focus on form' },
					{ name: 'Lat Pulldowns', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Single Arm Dumbbell Rows', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Rear Delt Flyes', sets: 3, reps: '15-20', restTime: 60 },
					{ name: 'Preacher Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Incline Dumbbell Curls', sets: 3, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Legs B',
				isRestDay: false,
				exercises: [
					{ name: 'Front Squats', sets: 4, reps: '6-8', restTime: 180 },
					{ name: 'Walking Lunges', sets: 3, reps: '12 each leg', restTime: 90 },
					{ name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Seated Leg Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Hip Thrusts', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Seated Calf Raises', sets: 4, reps: '15-20', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			}
		]
	},
	{
		title: 'Bro Split (5-Day)',
		description:
			'The classic bodybuilding split that dedicates each day to a specific muscle group. Perfect for those who want to maximize volume per muscle group with adequate recovery time. Popular among bodybuilders for decades.',
		difficulty: 'intermediate',
		duration: 60,
		tags: ['bodybuilding', 'hypertrophy', '5-day', 'classic'],
		days: [
			{
				name: 'Chest Day',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Bench Press', sets: 4, reps: '8-10', restTime: 120 },
					{ name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Decline Bench Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Cable Crossovers', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Dumbbell Flyes', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Push-ups', sets: 3, reps: 'To failure', restTime: 60 }
				]
			},
			{
				name: 'Back Day',
				isRestDay: false,
				exercises: [
					{ name: 'Deadlifts', sets: 4, reps: '6-8', restTime: 180 },
					{ name: 'Barbell Rows', sets: 4, reps: '8-10', restTime: 120 },
					{ name: 'Lat Pulldowns', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Seated Cable Rows', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Straight Arm Pulldowns', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Hyperextensions', sets: 3, reps: '15', restTime: 60 }
				]
			},
			{
				name: 'Shoulder Day',
				isRestDay: false,
				exercises: [
					{ name: 'Overhead Press', sets: 4, reps: '8-10', restTime: 120 },
					{ name: 'Arnold Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Rear Delt Flyes', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Face Pulls', sets: 3, reps: '15-20', restTime: 60 },
					{ name: 'Shrugs', sets: 4, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Leg Day',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Squats', sets: 4, reps: '8-10', restTime: 180 },
					{ name: 'Leg Press', sets: 4, reps: '10-12', restTime: 120 },
					{ name: 'Romanian Deadlifts', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Leg Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Standing Calf Raises', sets: 4, reps: '15-20', restTime: 60 },
					{ name: 'Seated Calf Raises', sets: 3, reps: '15-20', restTime: 60 }
				]
			},
			{
				name: 'Arms Day',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Curls', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Close Grip Bench Press', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Hammer Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Skull Crushers', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Preacher Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Tricep Pushdowns', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Concentration Curls', sets: 2, reps: '15', restTime: 45 },
					{ name: 'Overhead Tricep Extension', sets: 2, reps: '15', restTime: 45 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			}
		]
	},
	{
		title: 'Upper/Lower Split (4-Day)',
		description:
			'A balanced 4-day split alternating between upper and lower body workouts. Allows for higher frequency training while maintaining good recovery. Ideal for intermediate lifters looking to progress in strength and size.',
		difficulty: 'intermediate',
		duration: 60,
		tags: ['strength', 'hypertrophy', '4-day', 'balanced'],
		days: [
			{
				name: 'Upper A (Strength)',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Bench Press', sets: 4, reps: '5', restTime: 180 },
					{ name: 'Barbell Rows', sets: 4, reps: '5', restTime: 180 },
					{ name: 'Overhead Press', sets: 3, reps: '6-8', restTime: 120 },
					{ name: 'Pull-ups', sets: 3, reps: '6-8', restTime: 120 },
					{ name: 'Barbell Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Tricep Pushdowns', sets: 3, reps: '10-12', restTime: 60 }
				]
			},
			{
				name: 'Lower A (Strength)',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Squats', sets: 4, reps: '5', restTime: 180 },
					{ name: 'Romanian Deadlifts', sets: 4, reps: '6-8', restTime: 150 },
					{ name: 'Leg Press', sets: 3, reps: '8-10', restTime: 120 },
					{ name: 'Leg Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Standing Calf Raises', sets: 4, reps: '10-12', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Upper B (Hypertrophy)',
				isRestDay: false,
				exercises: [
					{ name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Seated Cable Rows', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Lat Pulldowns', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Lateral Raises', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Face Pulls', sets: 3, reps: '15-20', restTime: 60 },
					{ name: 'Hammer Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Lower B (Hypertrophy)',
				isRestDay: false,
				exercises: [
					{ name: 'Front Squats', sets: 4, reps: '8-10', restTime: 120 },
					{ name: 'Stiff Leg Deadlifts', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Walking Lunges', sets: 3, reps: '12 each leg', restTime: 90 },
					{ name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Seated Leg Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Seated Calf Raises', sets: 4, reps: '15-20', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			}
		]
	},
	{
		title: 'Arnold Split (6-Day)',
		description:
			'Made famous by Arnold Schwarzenegger, this split pairs chest with back, shoulders with arms, and dedicates separate days to legs. The antagonist muscle pairing allows for supersets and increased blood flow. A legendary program for serious bodybuilders.',
		difficulty: 'advanced',
		duration: 75,
		tags: ['bodybuilding', 'arnold', '6-day', 'classic', 'advanced'],
		days: [
			{
				name: 'Chest & Back',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Bench Press', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Wide Grip Pull-ups', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Barbell Rows', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Dumbbell Flyes', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'T-Bar Rows', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Dips', sets: 3, reps: 'To failure', restTime: 60 },
					{
						name: 'Close Grip Lat Pulldowns',
						sets: 3,
						reps: '12-15',
						restTime: 60
					}
				]
			},
			{
				name: 'Shoulders & Arms',
				isRestDay: false,
				exercises: [
					{ name: 'Overhead Press', sets: 4, reps: '8-10', restTime: 120 },
					{ name: 'Barbell Curls', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Close Grip Bench Press', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Seated Dumbbell Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Skull Crushers', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Rear Delt Flyes', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Concentration Curls', sets: 2, reps: '12-15', restTime: 45 },
					{ name: 'Tricep Kickbacks', sets: 2, reps: '12-15', restTime: 45 }
				]
			},
			{
				name: 'Legs',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Squats', sets: 5, reps: '8-10', restTime: 180 },
					{ name: 'Leg Press', sets: 4, reps: '10-12', restTime: 120 },
					{ name: 'Stiff Leg Deadlifts', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Leg Extensions', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Leg Curls', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Standing Calf Raises', sets: 5, reps: '15-20', restTime: 60 },
					{ name: 'Seated Calf Raises', sets: 4, reps: '15-20', restTime: 60 }
				]
			},
			{
				name: 'Chest & Back',
				isRestDay: false,
				exercises: [
					{ name: 'Incline Barbell Press', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Chin-ups', sets: 4, reps: '8-10', restTime: 90 },
					{ name: 'Flat Dumbbell Press', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Single Arm Dumbbell Rows', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Cable Crossovers', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Seated Cable Rows', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Pullovers', sets: 3, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Shoulders & Arms',
				isRestDay: false,
				exercises: [
					{ name: 'Arnold Press', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Preacher Curls', sets: 4, reps: '10-12', restTime: 60 },
					{ name: 'Tricep Pushdowns', sets: 4, reps: '10-12', restTime: 60 },
					{ name: 'Cable Lateral Raises', sets: 4, reps: '12-15', restTime: 60 },
					{ name: 'Hammer Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Upright Rows', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Reverse Curls', sets: 2, reps: '15', restTime: 45 }
				]
			},
			{
				name: 'Legs',
				isRestDay: false,
				exercises: [
					{ name: 'Front Squats', sets: 4, reps: '8-10', restTime: 150 },
					{ name: 'Hack Squats', sets: 4, reps: '10-12', restTime: 120 },
					{ name: 'Romanian Deadlifts', sets: 4, reps: '10-12', restTime: 90 },
					{ name: 'Walking Lunges', sets: 3, reps: '12 each leg', restTime: 90 },
					{ name: 'Leg Extensions', sets: 3, reps: '15-20', restTime: 60 },
					{ name: 'Lying Leg Curls', sets: 3, reps: '15-20', restTime: 60 },
					{ name: 'Calf Press', sets: 5, reps: '15-20', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			}
		]
	},
	{
		title: 'Full Body (3-Day)',
		description:
			'A time-efficient program hitting all major muscle groups three times per week. Perfect for beginners or those with limited time. Each session is a complete workout, making it easier to maintain consistency.',
		difficulty: 'beginner',
		duration: 50,
		tags: ['beginner', 'full-body', '3-day', 'efficient'],
		days: [
			{
				name: 'Full Body A',
				isRestDay: false,
				exercises: [
					{
						name: 'Barbell Squats',
						sets: 3,
						reps: '8-10',
						restTime: 150,
						notes: 'Focus on depth'
					},
					{ name: 'Barbell Bench Press', sets: 3, reps: '8-10', restTime: 120 },
					{ name: 'Barbell Rows', sets: 3, reps: '8-10', restTime: 120 },
					{ name: 'Overhead Press', sets: 3, reps: '8-10', restTime: 90 },
					{ name: 'Romanian Deadlifts', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Plank', sets: 3, reps: '30-60 seconds', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Full Body B',
				isRestDay: false,
				exercises: [
					{ name: 'Deadlifts', sets: 3, reps: '5', restTime: 180, notes: 'Focus on form' },
					{ name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Lat Pulldowns', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Leg Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Face Pulls', sets: 3, reps: '15-20', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Full Body C',
				isRestDay: false,
				exercises: [
					{ name: 'Front Squats', sets: 3, reps: '8-10', restTime: 150 },
					{ name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Seated Cable Rows', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Lateral Raises', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Hip Thrusts', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Barbell Curls', sets: 2, reps: '12-15', restTime: 60 },
					{ name: 'Tricep Pushdowns', sets: 2, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			}
		]
	},
	{
		title: 'PHUL (Power Hypertrophy Upper Lower)',
		description:
			'A 4-day program combining powerlifting and bodybuilding principles. Upper and lower power days focus on compound lifts with low reps for strength, while hypertrophy days use higher reps for muscle growth. Best of both worlds.',
		difficulty: 'intermediate',
		duration: 70,
		tags: ['powerbuilding', 'strength', 'hypertrophy', '4-day'],
		days: [
			{
				name: 'Upper Power',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Bench Press', sets: 4, reps: '3-5', restTime: 180 },
					{ name: 'Pendlay Rows', sets: 4, reps: '3-5', restTime: 180 },
					{ name: 'Overhead Press', sets: 3, reps: '5-8', restTime: 150 },
					{ name: 'Weighted Pull-ups', sets: 3, reps: '5-8', restTime: 150 },
					{ name: 'Barbell Curls', sets: 2, reps: '6-10', restTime: 90 },
					{ name: 'Skull Crushers', sets: 2, reps: '6-10', restTime: 90 }
				]
			},
			{
				name: 'Lower Power',
				isRestDay: false,
				exercises: [
					{ name: 'Barbell Squats', sets: 4, reps: '3-5', restTime: 240 },
					{ name: 'Deadlifts', sets: 4, reps: '3-5', restTime: 240 },
					{ name: 'Leg Press', sets: 3, reps: '10-15', restTime: 120 },
					{ name: 'Leg Curls', sets: 3, reps: '6-10', restTime: 90 },
					{ name: 'Standing Calf Raises', sets: 4, reps: '6-10', restTime: 90 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Upper Hypertrophy',
				isRestDay: false,
				exercises: [
					{ name: 'Incline Dumbbell Press', sets: 4, reps: '8-12', restTime: 90 },
					{ name: 'Cable Rows', sets: 4, reps: '8-12', restTime: 90 },
					{ name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Lat Pulldowns', sets: 3, reps: '10-12', restTime: 90 },
					{ name: 'Dumbbell Flyes', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Lateral Raises', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Incline Dumbbell Curls', sets: 3, reps: '10-12', restTime: 60 },
					{ name: 'Tricep Pushdowns', sets: 3, reps: '10-12', restTime: 60 }
				]
			},
			{
				name: 'Lower Hypertrophy',
				isRestDay: false,
				exercises: [
					{ name: 'Front Squats', sets: 4, reps: '8-12', restTime: 120 },
					{ name: 'Romanian Deadlifts', sets: 4, reps: '8-12', restTime: 120 },
					{ name: 'Hack Squats', sets: 3, reps: '10-15', restTime: 90 },
					{ name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Lying Leg Curls', sets: 3, reps: '12-15', restTime: 60 },
					{ name: 'Seated Calf Raises', sets: 4, reps: '12-15', restTime: 60 }
				]
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			},
			{
				name: 'Rest Day',
				isRestDay: true,
				exercises: []
			}
		]
	}
];

async function createSystemUser(db: ReturnType<typeof drizzle<typeof schema>>) {
	const existingUser = await db.select().from(user).where(eq(user.id, SYSTEM_USER_ID));

	if (existingUser.length === 0) {
		await db.insert(user).values({
			id: SYSTEM_USER_ID,
			name: 'SplitShare',
			email: SYSTEM_USER_EMAIL,
			emailVerified: true
		});
		console.log('Created system user');
	} else {
		console.log('System user already exists');
	}
}

async function seedDefaultSplits(db: ReturnType<typeof drizzle<typeof schema>>) {
	console.log('Seeding default splits...');

	// Create system user first
	await createSystemUser(db);

	for (const splitData of defaultSplits) {
		// Check if split already exists
		const existingSplit = await db
			.select()
			.from(splits)
			.where(eq(splits.title, splitData.title))
			.limit(1);

		if (existingSplit.length > 0) {
			console.log(`Split "${splitData.title}" already exists, skipping...`);
			continue;
		}

		// Create the split
		const [newSplit] = await db
			.insert(splits)
			.values({
				userId: SYSTEM_USER_ID,
				title: splitData.title,
				description: splitData.description,
				difficulty: splitData.difficulty,
				duration: splitData.duration,
				tags: splitData.tags,
				isPublic: true,
				isDefault: true
			})
			.returning();

		console.log(`Created split: ${splitData.title}`);

		// Create days and exercises
		for (let dayIndex = 0; dayIndex < splitData.days.length; dayIndex++) {
			const dayData = splitData.days[dayIndex];

			const [newDay] = await db
				.insert(splitDays)
				.values({
					splitId: newSplit.id,
					dayNumber: dayIndex + 1,
					name: dayData.name,
					isRestDay: dayData.isRestDay
				})
				.returning();

			// Create exercises for non-rest days
			if (!dayData.isRestDay && dayData.exercises.length > 0) {
				for (let exerciseIndex = 0; exerciseIndex < dayData.exercises.length; exerciseIndex++) {
					const exerciseData = dayData.exercises[exerciseIndex];

					await db.insert(dayExercises).values({
						dayId: newDay.id,
						exerciseName: exerciseData.name,
						sets: exerciseData.sets,
						reps: exerciseData.reps,
						restTime: exerciseData.restTime,
						order: exerciseIndex + 1,
						notes: exerciseData.notes
					});
				}
			}
		}

		console.log(`  Added ${splitData.days.length} days with exercises`);
	}

	console.log('Default splits seeded successfully!');
}

// Main execution
async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	console.log('Connecting to database...');
	const client = neon(databaseUrl);
	const db = drizzle(client, { schema });

	await seedDefaultSplits(db);
	console.log('Done!');
}

main().catch(console.error);
