// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, User } from 'better-auth/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const BETTER_AUTH_SECRET: string;
	export const BETTER_AUTH_URL: string;
	export const RESEND_API_KEY: string;
	export const EMAIL_FROM: string;
	export const SENTRY_DSN: string;
	export const UPSTASH_REDIS_REST_URL: string;
	export const UPSTASH_REDIS_REST_TOKEN: string;
}

declare module '$env/static/public' {
	export const PUBLIC_APP_URL: string;
}

export {};
