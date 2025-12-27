import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as schema from '../db/schema';
import { building } from '$app/environment';

function createAuth() {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'pg',
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification
			}
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24 // 1 day
		}
	});
}

type AuthInstance = ReturnType<typeof createAuth>;
let _auth: AuthInstance | null = null;

export const auth = new Proxy({} as AuthInstance, {
	get(_target, prop) {
		if (building) {
			throw new Error('Auth cannot be accessed during build');
		}
		if (!_auth) {
			_auth = createAuth();
		}
		return Reflect.get(_auth, prop);
	}
});

export type Auth = AuthInstance;
