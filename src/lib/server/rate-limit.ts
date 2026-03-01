import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { logger } from './logger';

const UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

// Check if Redis is configured
const isRedisConfigured = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN;

if (!isRedisConfigured) {
	logger.warn('Redis not configured — using in-memory rate limiting fallback', {
		hint: 'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed rate limiting'
	});
}

// Create Redis instance only if configured
const redis = isRedisConfigured
	? new Redis({
			url: UPSTASH_REDIS_REST_URL,
			token: UPSTASH_REDIS_REST_TOKEN
		})
	: null;

/**
 * Simple in-memory sliding window rate limiter.
 * Used as a fallback when Redis is unavailable.
 * Not suitable for multi-instance deployments — use Redis for production.
 */
class InMemoryRateLimiter {
	private windows = new Map<string, { timestamps: number[] }>();
	private readonly maxRequests: number;
	private readonly windowMs: number;

	constructor(maxRequests: number, windowMs: number) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	async limit(identifier: string): Promise<{
		success: boolean;
		limit: number;
		remaining: number;
		reset: number;
	}> {
		const now = Date.now();
		const windowStart = now - this.windowMs;

		let entry = this.windows.get(identifier);
		if (!entry) {
			entry = { timestamps: [] };
			this.windows.set(identifier, entry);
		}

		// Remove expired timestamps
		entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

		const remaining = Math.max(0, this.maxRequests - entry.timestamps.length);
		const reset = now + this.windowMs;

		if (entry.timestamps.length >= this.maxRequests) {
			return { success: false, limit: this.maxRequests, remaining: 0, reset };
		}

		entry.timestamps.push(now);
		return { success: true, limit: this.maxRequests, remaining: remaining - 1, reset };
	}
}

function createInMemoryLimiter(maxRequests: number, windowMs: number): InMemoryRateLimiter {
	return new InMemoryRateLimiter(maxRequests, windowMs);
}

type RateLimiter = Ratelimit | InMemoryRateLimiter;

type Duration = `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`;

function durationToMs(duration: Duration): number {
	const [value, unit] = duration.split(' ') as [string, string];
	const num = Number(value);
	const multipliers: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
	return num * (multipliers[unit] ?? 1);
}

function createLimiter(maxRequests: number, window: Duration, prefix: string): RateLimiter {
	if (redis) {
		return new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(maxRequests, window),
			analytics: true,
			prefix: `ratelimit:${prefix}`
		});
	}
	return createInMemoryLimiter(maxRequests, durationToMs(window));
}

// Rate limiters — Redis-backed when available, in-memory fallback otherwise
export const authLimiter = createLimiter(5, '15 m', 'auth');
export const apiLimiter = createLimiter(100, '1 m', 'api');
export const uploadLimiter = createLimiter(10, '1 h', 'upload');
export const feedLimiter = createLimiter(200, '1 m', 'feed');
export const mutationLimiter = createLimiter(30, '1 m', 'mutation');

export async function rateLimit(
	event: RequestEvent,
	limiter: RateLimiter
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
