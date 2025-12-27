import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				authToken: process.env.SENTRY_AUTH_TOKEN
			}
		}),
		sveltekit()
	],
	ssr: {
		// Externalize postgres for Cloudflare Workers - it's only used in local dev
		noExternal: process.env.NODE_ENV === 'production' ? [] : undefined,
		external: ['postgres', 'drizzle-orm/postgres-js']
	}
});
