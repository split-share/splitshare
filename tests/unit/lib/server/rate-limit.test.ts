import { describe, it, expect, vi } from 'vitest';
import { rateLimit, rateLimitError, feedLimiter } from '$lib/server/rate-limit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Ratelimit } from '@upstash/ratelimit';

describe('rate-limit', () => {
	describe('rateLimit', () => {
		it('should allow requests with in-memory fallback limiter', async () => {
			const mockEvent = {
				locals: { user: null },
				getClientAddress: () => '127.0.0.1',
				setHeaders: vi.fn()
			} as unknown as RequestEvent;

			// feedLimiter uses in-memory fallback when Redis is not configured (test env)
			const result = await rateLimit(mockEvent, feedLimiter);

			expect(result.success).toBe(true);
			expect(result.remaining).toBeGreaterThanOrEqual(0);
			expect(result.reset).toBeInstanceOf(Date);
		});

		it('should use user ID as identifier when authenticated', async () => {
			const mockLimiter = {
				limit: vi.fn().mockResolvedValue({
					success: true,
					limit: 100,
					remaining: 99,
					reset: Date.now() + 60000
				})
			};

			const mockEvent = {
				locals: { user: { id: 'user-123' } },
				getClientAddress: () => '127.0.0.1',
				setHeaders: vi.fn()
			} as unknown as RequestEvent;

			await rateLimit(mockEvent, mockLimiter as unknown as Ratelimit);

			expect(mockLimiter.limit).toHaveBeenCalledWith('user-123');
		});

		it('should use IP address as identifier when not authenticated', async () => {
			const mockLimiter = {
				limit: vi.fn().mockResolvedValue({
					success: true,
					limit: 100,
					remaining: 99,
					reset: Date.now() + 60000
				})
			};

			const mockEvent = {
				locals: { user: null },
				getClientAddress: () => '192.168.1.1',
				setHeaders: vi.fn()
			} as unknown as RequestEvent;

			await rateLimit(mockEvent, mockLimiter as unknown as Ratelimit);

			expect(mockLimiter.limit).toHaveBeenCalledWith('192.168.1.1');
		});

		it('should set rate limit headers when limit exceeded', async () => {
			const resetTime = Date.now() + 60000;
			const mockLimiter = {
				limit: vi.fn().mockResolvedValue({
					success: false,
					limit: 100,
					remaining: 0,
					reset: resetTime
				})
			};

			const setHeadersMock = vi.fn();
			const mockEvent = {
				locals: { user: null },
				getClientAddress: () => '127.0.0.1',
				setHeaders: setHeadersMock
			} as unknown as RequestEvent;

			const result = await rateLimit(mockEvent, mockLimiter as unknown as Ratelimit);

			expect(result.success).toBe(false);
			expect(setHeadersMock).toHaveBeenCalledWith({
				'X-RateLimit-Limit': '100',
				'X-RateLimit-Remaining': '0',
				'X-RateLimit-Reset': resetTime.toString()
			});
		});
	});

	describe('rateLimitError', () => {
		it('should return 429 response with retry-after header', () => {
			const resetDate = new Date(Date.now() + 30000);
			const response = rateLimitError(resetDate);

			expect(response.status).toBe(429);
			expect(response.headers.get('Content-Type')).toBe('application/json');
			expect(response.headers.get('Retry-After')).toBeTruthy();
		});

		it('should include error message in response body', async () => {
			const resetDate = new Date(Date.now() + 30000);
			const response = rateLimitError(resetDate);
			const body = (await response.json()) as {
				error: string;
				message: string;
				retryAfter: number;
			};

			expect(body.error).toBe('Too many requests');
			expect(body.message).toBeTruthy();
			expect(body.retryAfter).toBeGreaterThan(0);
		});
	});
});
