import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL,
	token: UPSTASH_REDIS_REST_TOKEN
});

// Auth endpoints - stricter limits
export const authLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
	analytics: true,
	prefix: 'ratelimit:auth'
});

// API endpoints - standard limits
export const apiLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
	analytics: true,
	prefix: 'ratelimit:api'
});

// File upload - strict limits
export const uploadLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
	analytics: true,
	prefix: 'ratelimit:upload'
});

// Public feed - lenient limits
export const feedLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(200, '1 m'), // 200 requests per minute
	analytics: true,
	prefix: 'ratelimit:feed'
});

export async function rateLimit(
	event: RequestEvent,
	limiter: Ratelimit
): Promise<{ success: boolean; remaining: number; reset: Date }> {
	const identifier = event.locals.user?.id || event.getClientAddress();
	const { success, limit, remaining, reset } = await limiter.limit(identifier);

	if (!success) {
		event.setHeaders({
			'X-RateLimit-Limit': limit.toString(),
			'X-RateLimit-Remaining': remaining.toString(),
			'X-RateLimit-Reset': reset.toString()
		});
	}

	return { success, remaining, reset: new Date(reset) };
}

export function rateLimitError(reset: Date) {
	const retryAfter = Math.ceil((reset.getTime() - Date.now()) / 1000);
	return new Response(
		JSON.stringify({
			error: 'Too many requests',
			message: 'You have exceeded the rate limit. Please try again later.',
			retryAfter
		}),
		{
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'Retry-After': retryAfter.toString()
			}
		}
	);
}
