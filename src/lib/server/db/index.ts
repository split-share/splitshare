import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import { building } from '$app/environment';
import * as schema from './schema';

function createDb() {
	if (building) {
		return null as unknown as ReturnType<typeof drizzle<typeof schema>>;
	}
	const client = postgres(DATABASE_URL, {
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10
	});
	return drizzle(client, { schema });
}

export const db = createDb();
