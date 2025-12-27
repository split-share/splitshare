import { expect, test } from '@playwright/test';

test.describe('API Endpoints', () => {
	test.describe('Health Check', () => {
		test('should return healthy status', async ({ request }) => {
			const response = await request.get('/api/health');

			expect(response.status()).toBe(200);

			const body = await response.json();
			expect(body.status).toBe('healthy');
			expect(body.timestamp).toBeDefined();
		});

		test('should have correct content-type header', async ({ request }) => {
			const response = await request.get('/api/health');
			const contentType = response.headers()['content-type'];

			expect(contentType).toContain('application/json');
		});

		test('should respond quickly', async ({ request }) => {
			const start = Date.now();
			await request.get('/api/health');
			const duration = Date.now() - start;

			expect(duration).toBeLessThan(5000);
		});
	});

	test.describe('Protected API Endpoints', () => {
		test('should require authentication for workout sync', async ({ request }) => {
			const response = await request.post('/api/workout/sync', {
				data: { sessionId: 'test-id', exerciseElapsedSeconds: 0 }
			});

			expect([401, 403]).toContain(response.status());
		});
	});

	test.describe('Auth API', () => {
		test('should have auth endpoint available', async ({ request }) => {
			const response = await request.get('/api/auth/session');

			expect([200, 401]).toContain(response.status());
		});
	});

	test.describe('API Error Handling', () => {
		test('should return 404 for non-existent API routes', async ({ request }) => {
			const response = await request.get('/api/nonexistent');

			expect(response.status()).toBe(404);
		});

		test('should handle malformed requests gracefully', async ({ request }) => {
			const response = await request.post('/api/health', {
				data: 'invalid json',
				headers: { 'Content-Type': 'application/json' }
			});

			expect([400, 405, 200]).toContain(response.status());
		});
	});
});
