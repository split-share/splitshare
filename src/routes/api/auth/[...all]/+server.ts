import { auth } from '$lib/server/auth';
import { rateLimit, authLimiter, rateLimitError } from '$lib/server/rate-limit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	return auth.handler(event.request);
};

export const POST = async (event: RequestEvent) => {
	const rateLimitResult = await rateLimit(event, authLimiter);
	if (!rateLimitResult.success) {
		return rateLimitError(rateLimitResult.reset);
	}

	return auth.handler(event.request);
};
