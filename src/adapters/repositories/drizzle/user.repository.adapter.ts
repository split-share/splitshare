import { eq } from 'drizzle-orm';
import type { Database } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { IUserRepository } from '../../../core/ports/repositories/user.repository.port';
import { User } from '../../../core/domain/user/user.entity';

/**
 * Drizzle adapter for User repository
 */
export class DrizzleUserRepositoryAdapter implements IUserRepository {
	constructor(private db: Database) {}

	async findById(id: string): Promise<User | undefined> {
		const result = await this.db.select().from(user).where(eq(user.id, id)).limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async findByEmail(email: string): Promise<User | undefined> {
		const result = await this.db.select().from(user).where(eq(user.email, email)).limit(1);
		if (!result[0]) return undefined;
		return this.toEntity(result[0]);
	}

	async create(data: {
		id: string;
		name: string;
		email: string;
		emailVerified?: boolean;
		image?: string | null;
	}): Promise<User> {
		const [newUser] = await this.db
			.insert(user)
			.values({
				id: data.id,
				name: data.name,
				email: data.email,
				emailVerified: data.emailVerified ?? false,
				image: data.image ?? null
			})
			.returning();

		return this.toEntity(newUser);
	}

	async update(
		id: string,
		data: {
			name?: string;
			image?: string | null;
			emailVerified?: boolean;
		}
	): Promise<User> {
		const [updatedUser] = await this.db
			.update(user)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(user.id, id))
			.returning();

		return this.toEntity(updatedUser);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(user).where(eq(user.id, id));
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
		return result.length > 0;
	}

	private toEntity(raw: typeof user.$inferSelect): User {
		return new User(
			raw.id,
			raw.name,
			raw.email,
			raw.emailVerified,
			raw.image,
			raw.createdAt,
			raw.updatedAt
		);
	}
}
