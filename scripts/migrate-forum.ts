import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { forumCategories, forumTopics, forumPosts } from '../src/lib/server/db/schema';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function migrate() {
	console.log('Creating forum tables...');

	try {
		// Create forum_categories table
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS forum_categories (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				name TEXT NOT NULL,
				description TEXT NOT NULL,
				icon TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				"order" INTEGER NOT NULL,
				created_at TIMESTAMP NOT NULL DEFAULT NOW()
			);
		`);

		// Create forum_topics table
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS forum_topics (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				content TEXT NOT NULL,
				is_pinned BOOLEAN NOT NULL DEFAULT false,
				is_locked BOOLEAN NOT NULL DEFAULT false,
				view_count INTEGER NOT NULL DEFAULT 0,
				created_at TIMESTAMP NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMP NOT NULL DEFAULT NOW()
			);
		`);

		// Create forum_posts table
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS forum_posts (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
				content TEXT NOT NULL,
				created_at TIMESTAMP NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMP NOT NULL DEFAULT NOW()
			);
		`);

		console.log('✅ Forum tables created successfully!');

		// Seed categories
		console.log('\nSeeding forum categories...');

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

		for (const category of categories) {
			await db
				.insert(forumCategories)
				.values(category)
				.onConflictDoNothing({ target: forumCategories.slug });
		}

		console.log('✅ Forum categories seeded successfully!');
		console.log('\n🎉 Migration complete! You can now access the forum at /forum');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	} finally {
		await client.end();
	}
}

migrate();
