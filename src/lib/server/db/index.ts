import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

const client = postgres(DATABASE_URL, {
	max: 10, // Maximum pool connections
	idle_timeout: 20, // Idle connection timeout in seconds
	connect_timeout: 10 // Connection timeout in seconds
});
export const db = drizzle(client, { schema });
