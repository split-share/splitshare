import { auth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';

if (env.SENTRY_DSN) {
	Sentry.init({
		dsn: env.SENTRY_DSN,
		environment: process.env.NODE_ENV || 'development',
		tracesSampleRate: 1.0
	});
}

const authHandle: Handle = async ({ event, resolve }) => {
	const sessionData = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = sessionData?.session ?? null;
	event.locals.user = sessionData?.user ?? null;

	if (env.SENTRY_DSN && event.locals.user) {
		Sentry.setUser({
			id: event.locals.user.id,
			email: event.locals.user.email,
			username: event.locals.user.name
		});
	}

	return resolve(event);
};

export const handle = env.SENTRY_DSN ? sequence(Sentry.sentryHandle(), authHandle) : authHandle;

export const handleError = env.SENTRY_DSN ? Sentry.handleErrorWithSentry() : undefined;
