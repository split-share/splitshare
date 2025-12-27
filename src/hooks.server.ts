import { auth } from '$lib/server/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import { logger, RequestContext, createRequestLogger } from '$lib/server/logger';
import { building } from '$app/environment';
import { initDb } from '$lib/server/db';

if (env.SENTRY_DSN) {
	Sentry.init({
		dsn: env.SENTRY_DSN,
		environment: process.env.NODE_ENV || 'development',
		tracesSampleRate: 1.0
	});
}

// Allowed origins for CORS (configurable via env)
const ALLOWED_ORIGINS = env.CORS_ALLOWED_ORIGINS?.split(',') || [
	'http://localhost:5173',
	'http://localhost:4173'
];

/**
 * Logging middleware - initializes request context and emits wide event on completion
 * Following the "Wide Events" pattern from loggingsucks.com
 */
const loggingHandle: Handle = async ({ event, resolve }) => {
	const requestContext = new RequestContext();
	const url = new URL(event.request.url);

	requestContext.setRequest(event.request.method, url.pathname, event.request.url);

	event.locals.requestContext = requestContext;
	event.locals.logger = createRequestLogger(logger, requestContext);

	try {
		const response = await resolve(event);

		requestContext.setResponse(response.status);

		if (event.locals.user) {
			requestContext.setUser(event.locals.user.id, event.locals.user.email, event.locals.user.name);
		}

		// Emit wide event for request completion
		// Skip logging for static assets and internal SvelteKit requests
		if (!shouldSkipLogging(url.pathname)) {
			logger.emitWideEvent(requestContext.build());
		}

		return response;
	} catch (error) {
		requestContext.setError(error);
		requestContext.setResponse(500);

		// Always log errors
		logger.emitWideEvent(requestContext.build('error'));

		throw error;
	}
};

/**
 * Check if path should skip logging (static assets, internal SvelteKit requests)
 */
function shouldSkipLogging(pathname: string): boolean {
	const skipPatterns = [
		/^\/_app\//,
		/^\/favicon/,
		/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
		/__data\.json$/ // SvelteKit internal data requests
	];
	return skipPatterns.some((pattern) => pattern.test(pathname));
}

/**
 * Security headers middleware - adds security headers to all responses
 */
const securityHeadersHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), payment=()'
	);

	// Content Security Policy (adjust as needed for your app)
	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Content-Security-Policy',
			[
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline'",
				"style-src 'self' 'unsafe-inline'",
				"img-src 'self' data: https:",
				"font-src 'self' data:",
				"connect-src 'self' https:",
				"frame-ancestors 'self'"
			].join('; ')
		);
	}

	return response;
};

/**
 * CORS middleware - handles cross-origin requests
 */
const corsHandle: Handle = async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin');

	// Handle preflight requests
	if (event.request.method === 'OPTIONS') {
		if (origin && ALLOWED_ORIGINS.includes(origin)) {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': origin,
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Max-Age': '86400'
				}
			});
		}
		return new Response(null, { status: 403 });
	}

	const response = await resolve(event);

	// Add CORS headers to actual requests
	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
	}

	return response;
};

const authHandle: Handle = async ({ event, resolve }) => {
	// Skip auth during build (prerendering fallback pages)
	if (building) {
		event.locals.session = null;
		event.locals.user = null;
		return resolve(event);
	}

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

/**
 * Database initialization middleware - ensures db is ready before any request
 * Required for development mode where postgres.js needs async initialization
 */
const dbInitHandle: Handle = async ({ event, resolve }) => {
	if (!building) {
		await initDb();
	}
	return resolve(event);
};

// Build the handle sequence: db init -> logging -> security headers -> cors -> sentry (if enabled) -> auth
const handles: Handle[] = [dbInitHandle, loggingHandle, securityHeadersHandle, corsHandle];
if (env.SENTRY_DSN) {
	handles.push(Sentry.sentryHandle());
}
handles.push(authHandle);

export const handle = sequence(...handles);

/**
 * Error handler - logs errors and forwards to Sentry if enabled
 */
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	// Log the error with context
	logger.error('Unhandled server error', {
		errorId,
		errorType: error instanceof Error ? error.name : 'UnknownError',
		errorMessage: error instanceof Error ? error.message : String(error),
		errorStack: error instanceof Error ? error.stack : undefined,
		method: event.request.method,
		path: new URL(event.request.url).pathname,
		statusCode: status,
		userId: event.locals.user?.id
	});

	// Forward to Sentry if enabled
	if (env.SENTRY_DSN) {
		Sentry.captureException(error, {
			extra: {
				errorId,
				status,
				message,
				method: event.request.method,
				url: event.request.url
			}
		});
	}

	return {
		message: 'An unexpected error occurred',
		errorId
	};
};
