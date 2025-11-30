import { db } from './index';
import { forumCategories } from './schema';

const categories = [
	{
		name: 'General Discussion',
		description: 'Talk about anything fitness related',
		icon: 'MessageSquare',
		slug: 'general-discussion',
		order: 1
	},
	{
		name: 'Workout Splits',
		description: 'Discuss and get feedback on workout splits',
		icon: 'Dumbbell',
		slug: 'workout-splits',
		order: 2
	},
	{
		name: 'Nutrition & Diet',
		description: 'Share nutrition tips and meal plans',
		icon: 'Apple',
		slug: 'nutrition-diet',
		order: 3
	},
	{
		name: 'Progress & Goals',
		description: 'Share your fitness journey and achievements',
		icon: 'TrendingUp',
		slug: 'progress-goals',
		order: 4
	},
	{
		name: 'Form & Technique',
		description: 'Get advice on exercise form and technique',
		icon: 'Target',
		slug: 'form-technique',
		order: 5
	}
];

export async function seedForumCategories() {
	console.log('Seeding forum categories...');

	for (const category of categories) {
		await db.insert(forumCategories).values(category).onConflictDoNothing();
	}

	console.log('Forum categories seeded successfully!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	await seedForumCategories();
	process.exit(0);
}
