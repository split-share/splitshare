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
	build: {
		rollupOptions: {
			onwarn(warning, warn) {
				// Suppress circular dependency warnings from third-party libraries
				if (warning.code === 'CIRCULAR_DEPENDENCY') {
					const msg = warning.message || '';
					if (
						msg.includes('kysely') ||
						msg.includes('svelte/src/internal') ||
						msg.includes('d3-interpolate')
					) {
						return;
					}
				}
				warn(warning);
			}
		}
	}
});
