import { auth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { SENTRY_DSN } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';

Sentry.init({
	dsn: SENTRY_DSN,
	environment: process.env.NODE_ENV || 'development',
	tracesSampleRate: 1.0
});

const authHandle: Handle = async ({ event, resolve }) => {
	const sessionData = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = sessionData?.session ?? null;
	event.locals.user = sessionData?.user ?? null;

	// Set Sentry user context
	if (event.locals.user) {
		Sentry.setUser({
			id: event.locals.user.id,
			email: event.locals.user.email,
			username: event.locals.user.name
		});
	}

	return resolve(event);
};

export const handle = sequence(Sentry.sentryHandle(), authHandle);

export const handleError = Sentry.handleErrorWithSentry();
