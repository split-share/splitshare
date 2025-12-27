import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';
import { building } from '$app/environment';

// Lazy initialization to avoid connecting during build
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDb() {
	const client = postgres(DATABASE_URL, {
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10
	});
	return drizzle(client, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
	get(_target, prop) {
		if (building) {
			throw new Error('Database cannot be accessed during build');
		}
		if (!_db) {
			_db = createDb();
		}
		return Reflect.get(_db, prop);
	}
});
