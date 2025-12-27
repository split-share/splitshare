import { eq, and, desc, sql, like, or, inArray } from 'drizzle-orm';
import type { Database } from '$lib/server/db';
import { forumCategories, forumTopics, forumPosts, user } from '$lib/server/db/schema';
import type { IForumRepository } from '$core/ports/repositories/forum.repository.port';
import type {
	ForumCategory,
	ForumCategoryWithStats,
	ForumTopicWithDetails,
	ForumPostWithAuthor,
	CreateTopicDto,
	UpdateTopicDto,
	CreatePostDto,
	UpdatePostDto,
	TopicFiltersDto,
	PaginationDto
} from '$core/domain/forum/forum.dto';

export class DrizzleForumRepositoryAdapter implements IForumRepository {
	constructor(private db: Database) {}

	// Categories

	async findAllCategories(): Promise<ForumCategory[]> {
		return this.db.select().from(forumCategories).orderBy(forumCategories.order);
	}

	async findCategoryBySlug(slug: string): Promise<ForumCategory | undefined> {
		const result = await this.db
			.select()
			.from(forumCategories)
			.where(eq(forumCategories.slug, slug))
			.limit(1);
		return result[0];
	}

	async findCategoriesWithStats(): Promise<ForumCategoryWithStats[]> {
		const categories = await this.findAllCategories();

		const stats = await Promise.all(
			categories.map(async (category) => {
				const [topicCount, postCount, lastActivity] = await Promise.all([
					this.getTopicCountByCategory(category.id),
					this.getPostCountByCategory(category.id),
					this.getLastActivityByCategory(category.id)
				]);

				return {
					...category,
					topicCount,
					postCount,
					lastActivity
				};
			})
		);

		return stats;
	}

	private async getTopicCountByCategory(categoryId: string): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`cast(count(*) as integer)` })
			.from(forumTopics)
			.where(eq(forumTopics.categoryId, categoryId));
		return result[0]?.count ?? 0;
	}

	private async getPostCountByCategory(categoryId: string): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`cast(count(*) as integer)` })
			.from(forumPosts)
			.innerJoin(forumTopics, eq(forumPosts.topicId, forumTopics.id))
			.where(eq(forumTopics.categoryId, categoryId));
		return result[0]?.count ?? 0;
	}

	private async getLastActivityByCategory(categoryId: string) {
		const result = await this.db
			.select({
				topicId: forumTopics.id,
				topicTitle: forumTopics.title,
				userName: user.name,
				createdAt: forumTopics.createdAt
			})
			.from(forumTopics)
			.innerJoin(user, eq(forumTopics.userId, user.id))
			.where(eq(forumTopics.categoryId, categoryId))
			.orderBy(desc(forumTopics.createdAt))
			.limit(1);

		return result[0];
	}

	// Topics

	async findTopicById(id: string): Promise<ForumTopicWithDetails | undefined> {
		const [topic] = await this.db
			.select({
				topic: forumTopics,
				author: {
					id: user.id,
					name: user.name,
					image: user.image
				},
				category: {
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug
				},
				postCount: sql<number>`cast(count(distinct ${forumPosts.id}) as integer)`
			})
			.from(forumTopics)
			.innerJoin(user, eq(forumTopics.userId, user.id))
			.innerJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id))
			.leftJoin(forumPosts, eq(forumTopics.id, forumPosts.topicId))
			.where(eq(forumTopics.id, id))
			.groupBy(
				forumTopics.id,
				user.id,
				user.name,
				user.image,
				forumCategories.id,
				forumCategories.name,
				forumCategories.slug
			);

		if (!topic) return undefined;

		const lastPost = await this.getLastPostByTopic(id);

		return {
			...topic.topic,
			author: topic.author,
			category: topic.category,
			postCount: topic.postCount,
			lastPost
		};
	}

	private async getLastPostByTopic(topicId: string) {
		const result = await this.db
			.select({
				id: forumPosts.id,
				userId: forumPosts.userId,
				userName: user.name,
				createdAt: forumPosts.createdAt
			})
			.from(forumPosts)
			.innerJoin(user, eq(forumPosts.userId, user.id))
			.where(eq(forumPosts.topicId, topicId))
			.orderBy(desc(forumPosts.createdAt))
			.limit(1);

		return result[0];
	}

	async findTopicsWithFilters(
		filters: TopicFiltersDto,
		pagination: PaginationDto
	): Promise<ForumTopicWithDetails[]> {
		const conditions = [];

		if (filters.categoryId) {
			conditions.push(eq(forumTopics.categoryId, filters.categoryId));
		}

		if (filters.userId) {
			conditions.push(eq(forumTopics.userId, filters.userId));
		}

		if (filters.isPinned !== undefined) {
			conditions.push(eq(forumTopics.isPinned, filters.isPinned));
		}

		if (filters.search) {
			conditions.push(
				or(
					like(forumTopics.title, `%${filters.search}%`),
					like(forumTopics.content, `%${filters.search}%`)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const topics = await this.db
			.select({
				topic: forumTopics,
				author: {
					id: user.id,
					name: user.name,
					image: user.image
				},
				category: {
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug
				},
				postCount: sql<number>`cast(count(distinct ${forumPosts.id}) as integer)`
			})
			.from(forumTopics)
			.innerJoin(user, eq(forumTopics.userId, user.id))
			.innerJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id))
			.leftJoin(forumPosts, eq(forumTopics.id, forumPosts.topicId))
			.where(whereClause)
			.groupBy(
				forumTopics.id,
				user.id,
				user.name,
				user.image,
				forumCategories.id,
				forumCategories.name,
				forumCategories.slug
			)
			.orderBy(desc(forumTopics.isPinned), desc(forumTopics.updatedAt))
			.limit(pagination.limit)
			.offset(pagination.offset);

		if (topics.length === 0) return [];

		const topicIds = topics.map((t) => t.topic.id);
		const lastPosts = await this.getLastPostsByTopics(topicIds);

		return topics.map((topic) => ({
			...topic.topic,
			author: topic.author,
			category: topic.category,
			postCount: topic.postCount,
			lastPost: lastPosts.get(topic.topic.id)
		}));
	}

	private async getLastPostsByTopics(topicIds: string[]) {
		if (topicIds.length === 0) return new Map();

		const posts = await this.db
			.select({
				topicId: forumPosts.topicId,
				id: forumPosts.id,
				userId: forumPosts.userId,
				userName: user.name,
				createdAt: forumPosts.createdAt,
				rowNum: sql<number>`row_number() over (partition by ${forumPosts.topicId} order by ${forumPosts.createdAt} desc)`
			})
			.from(forumPosts)
			.innerJoin(user, eq(forumPosts.userId, user.id))
			.where(inArray(forumPosts.topicId, topicIds));

		const lastPostsMap = new Map();
		for (const post of posts) {
			if (post.rowNum === 1) {
				lastPostsMap.set(post.topicId, {
					id: post.id,
					userId: post.userId,
					userName: post.userName,
					createdAt: post.createdAt
				});
			}
		}

		return lastPostsMap;
	}

	async createTopic(input: CreateTopicDto): Promise<ForumTopicWithDetails> {
		const [topic] = await this.db
			.insert(forumTopics)
			.values({
				categoryId: input.categoryId,
				userId: input.userId,
				title: input.title,
				content: input.content
			})
			.returning();

		// Fetch the full topic with details
		const fullTopic = await this.findTopicById(topic.id);
		return fullTopic!;
	}

	async updateTopic(id: string, input: UpdateTopicDto): Promise<ForumTopicWithDetails> {
		await this.db
			.update(forumTopics)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(forumTopics.id, id));

		const fullTopic = await this.findTopicById(id);
		return fullTopic!;
	}

	async deleteTopic(id: string): Promise<void> {
		await this.db.delete(forumTopics).where(eq(forumTopics.id, id));
	}

	async incrementViewCount(id: string): Promise<void> {
		await this.db
			.update(forumTopics)
			.set({
				viewCount: sql`${forumTopics.viewCount} + 1`
			})
			.where(eq(forumTopics.id, id));
	}

	async topicExists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: forumTopics.id })
			.from(forumTopics)
			.where(eq(forumTopics.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isTopicOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: forumTopics.id })
			.from(forumTopics)
			.where(and(eq(forumTopics.id, id), eq(forumTopics.userId, userId)))
			.limit(1);
		return result.length > 0;
	}

	async isTopicLocked(id: string): Promise<boolean> {
		const result = await this.db
			.select({ isLocked: forumTopics.isLocked })
			.from(forumTopics)
			.where(eq(forumTopics.id, id))
			.limit(1);
		return result[0]?.isLocked ?? false;
	}

	// Posts

	async findPostsByTopicId(
		topicId: string,
		pagination: PaginationDto
	): Promise<ForumPostWithAuthor[]> {
		return this.db
			.select({
				post: forumPosts,
				author: {
					id: user.id,
					name: user.name,
					image: user.image
				}
			})
			.from(forumPosts)
			.innerJoin(user, eq(forumPosts.userId, user.id))
			.where(eq(forumPosts.topicId, topicId))
			.orderBy(forumPosts.createdAt)
			.limit(pagination.limit)
			.offset(pagination.offset)
			.then((results) =>
				results.map((r) => ({
					...r.post,
					author: r.author
				}))
			);
	}

	async createPost(input: CreatePostDto): Promise<ForumPostWithAuthor> {
		const [post] = await this.db
			.insert(forumPosts)
			.values({
				topicId: input.topicId,
				userId: input.userId,
				content: input.content
			})
			.returning();

		// Update topic's updatedAt timestamp
		await this.db
			.update(forumTopics)
			.set({ updatedAt: new Date() })
			.where(eq(forumTopics.id, input.topicId));

		// Fetch author info
		const [author] = await this.db
			.select({ id: user.id, name: user.name, image: user.image })
			.from(user)
			.where(eq(user.id, input.userId))
			.limit(1);

		return {
			...post,
			author
		};
	}

	async updatePost(id: string, input: UpdatePostDto): Promise<ForumPostWithAuthor> {
		const [post] = await this.db
			.update(forumPosts)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(forumPosts.id, id))
			.returning();

		// Fetch author info
		const [author] = await this.db
			.select({ id: user.id, name: user.name, image: user.image })
			.from(user)
			.where(eq(user.id, post.userId))
			.limit(1);

		return {
			...post,
			author
		};
	}

	async deletePost(id: string): Promise<void> {
		await this.db.delete(forumPosts).where(eq(forumPosts.id, id));
	}

	async postExists(id: string): Promise<boolean> {
		const result = await this.db
			.select({ id: forumPosts.id })
			.from(forumPosts)
			.where(eq(forumPosts.id, id))
			.limit(1);
		return result.length > 0;
	}

	async isPostOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: forumPosts.id })
			.from(forumPosts)
			.where(and(eq(forumPosts.id, id), eq(forumPosts.userId, userId)))
			.limit(1);
		return result.length > 0;
	}
}
