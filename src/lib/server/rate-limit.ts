import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

const UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

// Check if Redis is configured
const isRedisConfigured = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN;

// Create Redis instance only if configured
const redis = isRedisConfigured
	? new Redis({
			url: UPSTASH_REDIS_REST_URL,
			token: UPSTASH_REDIS_REST_TOKEN
		})
	: null;

// Create rate limiters only if Redis is available
export const authLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
			analytics: true,
			prefix: 'ratelimit:auth'
		})
	: null;

export const apiLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
			analytics: true,
			prefix: 'ratelimit:api'
		})
	: null;

export const uploadLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
			analytics: true,
			prefix: 'ratelimit:upload'
		})
	: null;

export const feedLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(200, '1 m'), // 200 requests per minute
			analytics: true,
			prefix: 'ratelimit:feed'
		})
	: null;

export async function rateLimit(
	event: RequestEvent,
	limiter: Ratelimit | null
): Promise<{ success: boolean; remaining: number; reset: Date }> {
	// If no limiter is configured (Redis not available), allow all requests
	if (!limiter) {
		return {
			success: true,
			remaining: 999,
			reset: new Date(Date.now() + 60000)
		};
	}

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
