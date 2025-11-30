import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';

// Users table - better-auth compatible
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

// Sessions table - better-auth compatible
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

// Accounts table - better-auth compatible for OAuth and credentials
export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
	refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

// Verification table - better-auth compatible
export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow()
});

// Exercises table
export const exercises = pgTable('exercises', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	difficulty: text('difficulty').notNull().default('intermediate'), // beginner, intermediate, advanced
	muscleGroup: text('muscle_group').notNull(),
	equipmentType: text('equipment_type').notNull(),
	imageUrl: text('image_url'), // Thumbnail image
	videoUrl: text('video_url'), // YouTube or demonstration video URL
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Splits table
export const splits = pgTable('splits', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	isPublic: boolean('is_public').notNull().default(false),
	isDefault: boolean('is_default').notNull().default(false),
	difficulty: text('difficulty').notNull().default('intermediate'), // beginner, intermediate, advanced
	duration: integer('duration'), // estimated duration in minutes
	imageUrl: text('image_url'),
	videoUrl: text('video_url'), // optional YouTube or video URL
	tags: text('tags').array(), // workout type tags
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Split days table - represents each day in a workout split
export const splitDays = pgTable('split_days', {
	id: uuid('id').defaultRandom().primaryKey(),
	splitId: uuid('split_id')
		.notNull()
		.references(() => splits.id, { onDelete: 'cascade' }),
	dayNumber: integer('day_number').notNull(), // 1-7 for ordering
	name: text('name').notNull(), // e.g., "Chest Day", "Rest Day", "Leg Day"
	isRestDay: boolean('is_rest_day').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Day exercises junction table - links exercises to specific days
export const dayExercises = pgTable('day_exercises', {
	id: uuid('id').defaultRandom().primaryKey(),
	dayId: uuid('day_id')
		.notNull()
		.references(() => splitDays.id, { onDelete: 'cascade' }),
	exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'cascade' }), // Optional: reference to structured exercise
	exerciseName: text('exercise_name').notNull(), // The name of the exercise (can be free text or from structured exercise)
	sets: integer('sets').notNull(),
	reps: text('reps').notNull(), // e.g., "10", "8-12", "AMRAP"
	restTime: integer('rest_time'), // rest time in seconds
	order: integer('order').notNull(), // order within the day
	notes: text('notes'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Split shares table
export const splitShares = pgTable('split_shares', {
	id: uuid('id').defaultRandom().primaryKey(),
	splitId: uuid('split_id')
		.notNull()
		.references(() => splits.id, { onDelete: 'cascade' }),
	shareToken: text('share_token').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	expiresAt: timestamp('expires_at')
});

// Social features tables

// Likes table
export const likes = pgTable('likes', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	splitId: uuid('split_id')
		.notNull()
		.references(() => splits.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Comments table
export const comments = pgTable('comments', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	splitId: uuid('split_id')
		.notNull()
		.references(() => splits.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Follows table
export const follows = pgTable('follows', {
	id: uuid('id').defaultRandom().primaryKey(),
	followerId: text('follower_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	followingId: text('following_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Workout logs table - track when users complete workouts
export const workoutLogs = pgTable('workout_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	splitId: uuid('split_id')
		.notNull()
		.references(() => splits.id, { onDelete: 'cascade' }),
	dayId: uuid('day_id')
		.notNull()
		.references(() => splitDays.id, { onDelete: 'cascade' }),
	duration: integer('duration'), // actual duration in minutes
	notes: text('notes'),
	completedAt: timestamp('completed_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Exercise logs table - track individual exercise performance
export const exerciseLogs = pgTable('exercise_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	workoutLogId: uuid('workout_log_id')
		.notNull()
		.references(() => workoutLogs.id, { onDelete: 'cascade' }),
	exerciseId: uuid('exercise_id')
		.notNull()
		.references(() => exercises.id, { onDelete: 'cascade' }),
	sets: integer('sets').notNull(),
	reps: text('reps').notNull(),
	weight: integer('weight'), // weight in kg or lbs
	notes: text('notes'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Personal records table - track best lifts
export const personalRecords = pgTable('personal_records', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	exerciseId: uuid('exercise_id')
		.notNull()
		.references(() => exercises.id, { onDelete: 'cascade' }),
	weight: integer('weight').notNull(),
	reps: integer('reps').notNull(),
	achievedAt: timestamp('achieved_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Bookmarks/Saved splits table
export const bookmarks = pgTable('bookmarks', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	splitId: uuid('split_id')
		.notNull()
		.references(() => splits.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Forum tables

// Forum categories table - predefined discussion categories
export const forumCategories = pgTable('forum_categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	icon: text('icon').notNull(), // Lucide icon name
	slug: text('slug').notNull().unique(),
	order: integer('order').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Forum topics table - user-created discussion threads
export const forumTopics = pgTable('forum_topics', {
	id: uuid('id').defaultRandom().primaryKey(),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => forumCategories.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	content: text('content').notNull(), // Rich text HTML
	isPinned: boolean('is_pinned').notNull().default(false),
	isLocked: boolean('is_locked').notNull().default(false),
	viewCount: integer('view_count').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Forum posts table - replies to topics
export const forumPosts = pgTable('forum_posts', {
	id: uuid('id').defaultRandom().primaryKey(),
	topicId: uuid('topic_id')
		.notNull()
		.references(() => forumTopics.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	content: text('content').notNull(), // Rich text HTML
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Split = typeof splits.$inferSelect;
export type SplitDay = typeof splitDays.$inferSelect;
export type DayExercise = typeof dayExercises.$inferSelect;
export type SplitShare = typeof splitShares.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
