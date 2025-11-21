import type { AuthRepository } from './auth.repository';
import type { User, CreateUserInput, UpdateUserInput } from './types';

export class AuthService {
	constructor(private repository: AuthRepository) {}

	async getUserById(id: string): Promise<User | undefined> {
		return this.repository.findById(id);
	}

	async getUserByEmail(email: string): Promise<User | undefined> {
		return this.repository.findByEmail(email);
	}

	async createUser(input: CreateUserInput): Promise<User> {
		const emailExists = await this.repository.emailExists(input.email);
		if (emailExists) {
			throw new Error('Email already exists');
		}
		return this.repository.create(input);
	}

	async updateUser(id: string, input: UpdateUserInput): Promise<User> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('User not found');
		}

		if (input.email) {
			const emailExists = await this.repository.emailExists(input.email);
			if (emailExists) {
				const existingUser = await this.repository.findByEmail(input.email);
				if (existingUser && existingUser.id !== id) {
					throw new Error('Email already exists');
				}
			}
		}

		return this.repository.update(id, input);
	}

	async deleteUser(id: string): Promise<void> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('User not found');
		}
		await this.repository.delete(id);
	}

	async verifyEmail(id: string): Promise<User> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('User not found');
		}
		return this.repository.verifyEmail(id);
	}

	async userExists(id: string): Promise<boolean> {
		return this.repository.exists(id);
	}
}
