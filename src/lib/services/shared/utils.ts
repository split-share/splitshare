import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '$lib/server/db/schema';

export type DbInstance = PostgresJsDatabase<typeof schema>;

export interface Repository {
	db: DbInstance;
}

export class BaseRepository implements Repository {
	constructor(public db: DbInstance) {}
}
