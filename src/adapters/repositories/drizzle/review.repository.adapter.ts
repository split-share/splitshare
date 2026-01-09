import { eq, desc, and, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { IReviewRepository } from '$core/ports/repositories/review.repository.port';
import { Review } from '$core/domain/split/review.entity';
import type {
	CreateReviewDto,
	UpdateReviewDto,
	ReviewWithUserDto,
	ReviewStatsDto
} from '$core/domain/split/review.dto';
import * as schema from '$lib/server/db/schema';

const { reviews, user } = schema;

/**
 * Drizzle ORM implementation of IReviewRepository
 * Handles all database operations for reviews using PostgreSQL
 */
export class DrizzleReviewRepositoryAdapter implements IReviewRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	/**
	 * Finds a review by ID
	 * @param {string} id - Review ID
	 * @returns {Promise<Review | undefined>} Review entity or undefined if not found
	 */
	async findById(id: string): Promise<Review | undefined> {
		const result = await this.db.select().from(reviews).where(eq(reviews.id, id)).limit(1);

		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByIdWithUser(id: string): Promise<ReviewWithUserDto | undefined> {
		const result = await this.db
			.select({
				id: reviews.id,
				userId: reviews.userId,
				splitId: reviews.splitId,
				rating: reviews.rating,
				content: reviews.content,
				createdAt: reviews.createdAt,
				updatedAt: reviews.updatedAt,
				userName: user.name,
				userImage: user.image
			})
			.from(reviews)
			.innerJoin(user, eq(reviews.userId, user.id))
			.where(eq(reviews.id, id))
			.limit(1);

		if (!result[0]) return undefined;

		return this.toReviewWithUserDto(result[0]);
	}

	async findByUserAndSplit(userId: string, splitId: string): Promise<Review | undefined> {
		const result = await this.db
			.select()
			.from(reviews)
			.where(and(eq(reviews.userId, userId), eq(reviews.splitId, splitId)))
			.limit(1);

		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findBySplitId(splitId: string): Promise<ReviewWithUserDto[]> {
		const result = await this.db
			.select({
				id: reviews.id,
				userId: reviews.userId,
				splitId: reviews.splitId,
				rating: reviews.rating,
				content: reviews.content,
				createdAt: reviews.createdAt,
				updatedAt: reviews.updatedAt,
				userName: user.name,
				userImage: user.image
			})
			.from(reviews)
			.innerJoin(user, eq(reviews.userId, user.id))
			.where(eq(reviews.splitId, splitId))
			.orderBy(desc(reviews.createdAt));

		return result.map((row) => this.toReviewWithUserDto(row));
	}

	/**
	 * Gets aggregate statistics for a split's reviews using SQL aggregations
	 * @param {string} splitId - Split ID
	 * @returns {Promise<ReviewStatsDto>} Average rating, total reviews, and rating distribution
	 */
	async getReviewStats(splitId: string): Promise<ReviewStatsDto> {
		const [stats] = await this.db
			.select({
				averageRating: sql<number>`cast(coalesce(avg(${reviews.rating}), 0) as numeric(3,2))`,
				totalReviews: sql<number>`cast(count(*) as integer)`,
				rating1: sql<number>`cast(count(*) filter (where ${reviews.rating} = 1) as integer)`,
				rating2: sql<number>`cast(count(*) filter (where ${reviews.rating} = 2) as integer)`,
				rating3: sql<number>`cast(count(*) filter (where ${reviews.rating} = 3) as integer)`,
				rating4: sql<number>`cast(count(*) filter (where ${reviews.rating} = 4) as integer)`,
				rating5: sql<number>`cast(count(*) filter (where ${reviews.rating} = 5) as integer)`
			})
			.from(reviews)
			.where(eq(reviews.splitId, splitId));

		return {
			averageRating: stats?.averageRating ? Number(stats.averageRating) : 0,
			totalReviews: stats?.totalReviews || 0,
			ratingDistribution: {
				1: stats?.rating1 || 0,
				2: stats?.rating2 || 0,
				3: stats?.rating3 || 0,
				4: stats?.rating4 || 0,
				5: stats?.rating5 || 0
			}
		};
	}

	async create(data: CreateReviewDto): Promise<Review> {
		const [result] = await this.db
			.insert(reviews)
			.values({
				userId: data.userId,
				splitId: data.splitId,
				rating: data.rating,
				content: data.content
			})
			.returning();

		return this.toEntity(result);
	}

	async update(id: string, data: UpdateReviewDto): Promise<Review> {
		const [result] = await this.db
			.update(reviews)
			.set({
				rating: data.rating,
				content: data.content,
				updatedAt: new Date()
			})
			.where(eq(reviews.id, id))
			.returning();

		return this.toEntity(result);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(reviews).where(eq(reviews.id, id));
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db.select().from(reviews).where(eq(reviews.id, id)).limit(1);

		return result.length > 0 && result[0].userId === userId;
	}

	async hasUserReviewedSplit(userId: string, splitId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: reviews.id })
			.from(reviews)
			.where(and(eq(reviews.userId, userId), eq(reviews.splitId, splitId)))
			.limit(1);

		return result.length > 0;
	}

	/**
	 * Maps database row to Review entity
	 * @param {typeof reviews.$inferSelect} row - Database row
	 * @returns {Review} Review entity
	 */
	private toEntity(row: typeof reviews.$inferSelect): Review {
		return new Review(
			row.id,
			row.userId,
			row.splitId,
			row.rating,
			row.content,
			row.createdAt,
			row.updatedAt
		);
	}

	/**
	 * Maps database row with joined user data to ReviewWithUserDto
	 * @param {Object} row - Database row with user fields
	 * @returns {ReviewWithUserDto} Review DTO with user information
	 */
	private toReviewWithUserDto(row: {
		id: string;
		userId: string;
		splitId: string;
		rating: number;
		content: string;
		createdAt: Date;
		updatedAt: Date;
		userName: string;
		userImage: string | null;
	}): ReviewWithUserDto {
		return {
			id: row.id,
			userId: row.userId,
			splitId: row.splitId,
			rating: row.rating,
			content: row.content,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			user: {
				id: row.userId,
				name: row.userName,
				image: row.userImage
			}
		};
	}
}
