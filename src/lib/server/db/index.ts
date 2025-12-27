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

function createDb(): Database {
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	// Production (Cloudflare): use Neon serverless with HTTP
	// This is synchronous and creates a new client per request (stateless)
	const client = neon(databaseUrl);
	return drizzleNeon(client, { schema });
}

// For development, we use postgres.js which needs async import
let _devDbPromise: Promise<Database> | null = null;

async function createDevDb(): Promise<Database> {
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

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
}

function getDb(): Database {
	if (_db) return _db;

	if (dev) {
		// In development, we need to handle async initialization
		// This will throw on first access but subsequent accesses will work
		throw new Error('Database not initialized. Call initDb() first in development mode.');
	}

	// Production: create synchronously using Neon HTTP
	_db = createDb();
	return _db;
}

/**
 * Initialize the database connection.
 * Must be called before using db in development mode.
 * In production (Cloudflare), this is optional as Neon HTTP is stateless.
 */
export async function initDb(): Promise<Database> {
	if (_db) return _db;

	if (dev) {
		if (!_devDbPromise) {
			_devDbPromise = createDevDb();
		}
		_db = await _devDbPromise;
	} else {
		_db = createDb();
	}

	return _db;
}

// Proxy that handles initialization
export const db = new Proxy({} as Database, {
	get(_target, prop) {
		if (building) {
			throw new Error('Database cannot be accessed during build');
		}

		const database = getDb();
		return Reflect.get(database, prop);
	}
});
