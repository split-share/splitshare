import { describe, it, expect, vi } from 'vitest';
import type { PageServerLoad } from '../../../src/routes/$types';

// Mock dependencies
vi.mock('$lib/services/splits', () => ({
	splitRepository: {
		findWithFilters: vi.fn().mockResolvedValue([])
	}
}));

vi.mock('$lib/server/rate-limit', () => ({
	rateLimit: vi.fn().mockResolvedValue({
		success: true,
		remaining: 100,
		reset: new Date()
	}),
	feedLimiter: {},
	rateLimitError: vi.fn()
}));

describe('page.server', () => {
	describe('load function', () => {
		it('should return default splits and user data', async () => {
			const { load } = await import('../../../src/routes/+page.server');

			const mockEvent = {
				request: new Request('http://localhost'),
				locals: {
					user: {
						id: 'user-123',
						name: 'Test User',
						email: 'test@example.com',
						emailVerified: false,
						image: null,
						createdAt: new Date(),
						updatedAt: new Date()
					},
					session: null
				},
				params: {},
				url: new URL('http://localhost'),
				route: { id: '/' },
				isDataRequest: false,
				isSubRequest: false,
				isRemoteRequest: false,
				fetch: global.fetch,
				platform: undefined,
				cookies: {} as never,
				setHeaders: vi.fn(),
				getClientAddress: () => '127.0.0.1',
				parent: vi.fn().mockResolvedValue({}),
				depends: vi.fn(),
				untrack: vi.fn(),
				tracing: {} as never
			} as Parameters<PageServerLoad>[0];

			const result = await load(mockEvent);

			expect(result).toHaveProperty('defaultSplits');
			expect(result).toHaveProperty('user');
			expect(result).toHaveProperty('appliedFilter');
		});

		it('should handle difficulty filter from query params', async () => {
			const { load } = await import('../../../src/routes/+page.server');

			const mockEvent = {
				request: new Request('http://localhost?difficulty=beginner'),
				locals: { user: null, session: null },
				params: {},
				url: new URL('http://localhost?difficulty=beginner'),
				route: { id: '/' },
				isDataRequest: false,
				isSubRequest: false,
				isRemoteRequest: false,
				fetch: global.fetch,
				platform: undefined,
				cookies: {} as never,
				setHeaders: vi.fn(),
				getClientAddress: () => '127.0.0.1',
				parent: vi.fn().mockResolvedValue({}),
				depends: vi.fn(),
				untrack: vi.fn(),
				tracing: {} as never
			} as Parameters<PageServerLoad>[0];

			const result = await load(mockEvent);

			expect(result).toBeDefined();
			expect(result).not.toBeUndefined();
			expect((result as { appliedFilter: string }).appliedFilter).toBe('beginner');
		});

		it('should return null user when not authenticated', async () => {
			const { load } = await import('../../../src/routes/+page.server');

			const mockEvent = {
				request: new Request('http://localhost'),
				locals: { user: null, session: null },
				params: {},
				url: new URL('http://localhost'),
				route: { id: '/' },
				isDataRequest: false,
				isSubRequest: false,
				isRemoteRequest: false,
				fetch: global.fetch,
				platform: undefined,
				cookies: {} as never,
				setHeaders: vi.fn(),
				getClientAddress: () => '127.0.0.1',
				parent: vi.fn().mockResolvedValue({}),
				depends: vi.fn(),
				untrack: vi.fn(),
				tracing: {} as never
			} as Parameters<PageServerLoad>[0];

			const result = await load(mockEvent);

			expect(result).toBeDefined();
			expect((result as { user: null }).user).toBeNull();
		});
	});
});
