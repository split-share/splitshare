import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { ILikeRepository } from '$core/ports/repositories/like.repository.port';
import { Like } from '$core/domain/split/like.entity';
import type { CreateLikeDto, LikeWithUserDto } from '$core/domain/split/like.dto';
import * as schema from '$lib/server/db/schema';

const { likes, user } = schema;

/**
 * Drizzle ORM implementation of ILikeRepository
 */
export class DrizzleLikeRepositoryAdapter implements ILikeRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<Like | undefined> {
		const result = await this.db.select().from(likes).where(eq(likes.id, id)).limit(1);

		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByUserIdAndSplitId(userId: string, splitId: string): Promise<Like | undefined> {
		const result = await this.db
			.select()
			.from(likes)
			.where(and(eq(likes.userId, userId), eq(likes.splitId, splitId)))
			.limit(1);

		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findBySplitId(splitId: string): Promise<LikeWithUserDto[]> {
		const result = await this.db
			.select({
				id: likes.id,
				userId: likes.userId,
				splitId: likes.splitId,
				createdAt: likes.createdAt,
				userName: user.name,
				userImage: user.image
			})
			.from(likes)
			.innerJoin(user, eq(likes.userId, user.id))
			.where(eq(likes.splitId, splitId))
			.orderBy(likes.createdAt);

		return result.map((row) => ({
			id: row.id,
			userId: row.userId,
			splitId: row.splitId,
			createdAt: row.createdAt,
			user: {
				id: row.userId,
				name: row.userName,
				image: row.userImage
			}
		}));
	}

	async countBySplitId(splitId: string): Promise<number> {
		const result = await this.db.select().from(likes).where(eq(likes.splitId, splitId));

		return result.length;
	}

	async create(data: CreateLikeDto): Promise<Like> {
		const [result] = await this.db
			.insert(likes)
			.values({
				userId: data.userId,
				splitId: data.splitId
			})
			.returning();

		return this.toEntity(result);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(likes).where(eq(likes.id, id));
	}

	async deleteByUserIdAndSplitId(userId: string, splitId: string): Promise<void> {
		await this.db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.splitId, splitId)));
	}

	async hasUserLiked(userId: string, splitId: string): Promise<boolean> {
		const result = await this.db
			.select()
			.from(likes)
			.where(and(eq(likes.userId, userId), eq(likes.splitId, splitId)))
			.limit(1);

		return result.length > 0;
	}

	private toEntity(row: typeof likes.$inferSelect): Like {
		return new Like(row.id, row.userId, row.splitId, row.createdAt);
	}
}
