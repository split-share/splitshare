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
	});
});
