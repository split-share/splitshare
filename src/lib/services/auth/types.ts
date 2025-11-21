import type { User, Session } from '$lib/server/db/schema';

export type { User, Session };

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserInput {
	name: string;
	email: string;
	password?: string;
	image?: string;
}

export interface UpdateUserInput {
	name?: string;
	email?: string;
	image?: string;
}
