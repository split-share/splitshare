import { eq } from 'drizzle-orm';
import { generateId } from 'better-auth';
import { user } from '$lib/server/db/schema';
import { BaseRepository } from '../shared/utils';
import type { User, CreateUserInput, UpdateUserInput } from './types';

export class AuthRepository extends BaseRepository {
	async findById(id: string): Promise<User | undefined> {
		const result = await this.db.select().from(user).where(eq(user.id, id)).limit(1);
		return result[0];
	}

	async findByEmail(email: string): Promise<User | undefined> {
		const result = await this.db.select().from(user).where(eq(user.email, email)).limit(1);
		return result[0];
	}

	async create(input: CreateUserInput): Promise<User> {
		const [newUser] = await this.db
			.insert(user)
			.values({
				id: generateId(),
				...input,
				emailVerified: false
			})
			.returning();
		return newUser;
	}

	async update(id: string, input: UpdateUserInput): Promise<User> {
		const [updatedUser] = await this.db
			.update(user)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(user.id, id))
			.returning();
		return updatedUser;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(user).where(eq(user.id, id));
	}

	async verifyEmail(id: string): Promise<User> {
		const [verifiedUser] = await this.db
			.update(user)
			.set({
				emailVerified: true,
				updatedAt: new Date()
			})
			.where(eq(user.id, id))
			.returning();
		return verifiedUser;
	}

	async exists(id: string): Promise<boolean> {
		const result = await this.db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
		return result.length > 0;
	}

	async emailExists(email: string): Promise<boolean> {
		const result = await this.db
			.select({ email: user.email })
			.from(user)
			.where(eq(user.email, email))
			.limit(1);
		return result.length > 0;
	}
}
