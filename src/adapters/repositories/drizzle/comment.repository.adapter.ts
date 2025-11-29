import { eq, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { ICommentRepository } from '$core/ports/repositories/comment.repository.port';
import { Comment } from '$core/domain/split/comment.entity';
import type {
	CreateCommentDto,
	UpdateCommentDto,
	CommentWithUserDto
} from '$core/domain/split/comment.dto';
import * as schema from '$lib/server/db/schema';

const { comments, user } = schema;

/**
 * Drizzle ORM implementation of ICommentRepository
 */
export class DrizzleCommentRepositoryAdapter implements ICommentRepository {
	constructor(private db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<Comment | undefined> {
		const result = await this.db.select().from(comments).where(eq(comments.id, id)).limit(1);

		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByIdWithUser(id: string): Promise<CommentWithUserDto | undefined> {
		const result = await this.db
			.select({
				id: comments.id,
				userId: comments.userId,
				splitId: comments.splitId,
				content: comments.content,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				userName: user.name,
				userImage: user.image
			})
			.from(comments)
			.innerJoin(user, eq(comments.userId, user.id))
			.where(eq(comments.id, id))
			.limit(1);

		if (!result[0]) return undefined;

		const row = result[0];
		return {
			id: row.id,
			userId: row.userId,
			splitId: row.splitId,
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

	async findBySplitId(splitId: string): Promise<CommentWithUserDto[]> {
		const result = await this.db
			.select({
				id: comments.id,
				userId: comments.userId,
				splitId: comments.splitId,
				content: comments.content,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				userName: user.name,
				userImage: user.image
			})
			.from(comments)
			.innerJoin(user, eq(comments.userId, user.id))
			.where(eq(comments.splitId, splitId))
			.orderBy(desc(comments.createdAt));

		return result.map((row) => ({
			id: row.id,
			userId: row.userId,
			splitId: row.splitId,
			content: row.content,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			user: {
				id: row.userId,
				name: row.userName,
				image: row.userImage
			}
		}));
	}

	async countBySplitId(splitId: string): Promise<number> {
		const result = await this.db.select().from(comments).where(eq(comments.splitId, splitId));

		return result.length;
	}

	async create(data: CreateCommentDto): Promise<Comment> {
		const [result] = await this.db
			.insert(comments)
			.values({
				userId: data.userId,
				splitId: data.splitId,
				content: data.content
			})
			.returning();

		return this.toEntity(result);
	}

	async update(id: string, data: UpdateCommentDto): Promise<Comment> {
		const [result] = await this.db
			.update(comments)
			.set({
				content: data.content,
				updatedAt: new Date()
			})
			.where(eq(comments.id, id))
			.returning();

		return this.toEntity(result);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(comments).where(eq(comments.id, id));
	}

	async isOwnedByUser(id: string, userId: string): Promise<boolean> {
		const result = await this.db.select().from(comments).where(eq(comments.id, id)).limit(1);

		return result.length > 0 && result[0].userId === userId;
	}

	private toEntity(row: typeof comments.$inferSelect): Comment {
		return new Comment(row.id, row.userId, row.splitId, row.content, row.createdAt, row.updatedAt);
	}
}
