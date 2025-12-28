import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
	appName: 'SplitShare',
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
			twoFactor: schema.twoFactor
		}
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // 1 day
	},
	plugins: [
		twoFactor({
			issuer: 'SplitShare',
			totpOptions: {
				digits: 6,
				period: 30
			},
			backupCodeOptions: {
				amount: 10,
				length: 8
			}
		})
	]
});

export type Auth = typeof auth;
