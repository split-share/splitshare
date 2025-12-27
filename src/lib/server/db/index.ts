import { drizzle as drizzleNeon, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { building, dev } from '$app/environment';

// Common database type that works with both drivers
export type Database = PostgresJsDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

// Lazy initialization to avoid connecting during build
let _db: Database | null = null;
let _dbPromise: Promise<Database> | null = null;

async function createDb(): Promise<Database> {
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	if (dev) {
		// Local development: dynamically import postgres.js to avoid bundling in production
		const [{ default: postgres }, { drizzle: drizzlePostgres }] = await Promise.all([
			import('postgres'),
			import('drizzle-orm/postgres-js')
		]);
		const client = postgres(databaseUrl, {
			max: 10,
			idle_timeout: 20,
			connect_timeout: 10
		});
		return drizzlePostgres(client, { schema });
	} else {
		// Production (Cloudflare): use Neon serverless with HTTP
		const client = neon(databaseUrl);
		return drizzleNeon(client, { schema });
	}
}

async function getDb(): Promise<Database> {
	if (_db) return _db;
	if (!_dbPromise) {
		_dbPromise = createDb().then((db) => {
			_db = db;
			return db;
		});
	}
	return _dbPromise;
}

// Proxy that handles async initialization transparently
export const db = new Proxy({} as Database, {
	get(_target, prop) {
		if (building) {
			throw new Error('Database cannot be accessed during build');
		}

		// If already initialized, return directly
		if (_db) {
			return Reflect.get(_db, prop);
		}

		// Return a function that awaits initialization then calls the method
		return async (...args: unknown[]) => {
			const database = await getDb();
			const method = Reflect.get(database, prop);
			if (typeof method === 'function') {
				return method.apply(database, args);
			}
			return method;
		};
	}
});
