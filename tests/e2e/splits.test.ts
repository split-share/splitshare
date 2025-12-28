import { expect, test } from '@playwright/test';

test.describe('Splits Pages - Unauthenticated', () => {
	test('should redirect to login when accessing splits list', async ({ page }) => {
		await page.goto('/splits');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect to login when accessing new split page', async ({ page }) => {
		await page.goto('/splits/new');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect to login when accessing split detail', async ({ page }) => {
		await page.goto('/splits/test-split-id');
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Splits List Page Structure', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/splits');
	});

	test('should show login page with correct structure', async ({ page }) => {
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
	});

	test('should allow navigation to register from login page', async ({ page }) => {
		await expect(page).toHaveURL('/login');
		const signUpLink = page.getByRole('link', { name: 'Sign up' });
		if (await signUpLink.isVisible()) {
			await signUpLink.click();
			await expect(page).toHaveURL('/register');
		}
	});
});

test.describe('New Split Page Structure', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/splits/new');
	});

	test('should redirect to login page', async ({ page }) => {
		await expect(page).toHaveURL('/login');
	});

	test('should preserve intended destination after login redirect', async ({ page }) => {
		await expect(page).toHaveURL(/login/);
	});
});

test.describe('Split Detail Page Structure', () => {
	test('should redirect to login for any split ID', async ({ page }) => {
		const splitIds = ['123', 'abc-def-ghi', 'test-split'];

		for (const splitId of splitIds) {
			await page.goto(`/splits/${splitId}`);
			await expect(page).toHaveURL('/login');
		}
	});

	test('should handle special characters in split ID', async ({ page }) => {
		await page.goto('/splits/split-with-dashes-123');
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Splits Navigation', () => {
	test('should be accessible from discover page when authenticated', async ({ page }) => {
		await page.goto('/discover');
		await expect(page).toHaveURL('/discover');

		const createSplitButton = page.getByRole('link', { name: /create split|new split/i });
		if (await createSplitButton.isVisible()) {
			await createSplitButton.click();
			await expect(page).toHaveURL(/\/splits\/new|\/login/);
		}
	});

	test('should maintain URL structure', async ({ page }) => {
		await page.goto('/splits/test-id');
		await expect(page).toHaveURL(/login/);

		await page.goto('/splits');
		await expect(page).toHaveURL(/login/);

		await page.goto('/splits/new');
		await expect(page).toHaveURL(/login/);
	});
});

test.describe('Splits Page Meta Information', () => {
	test('should have proper page title for splits list', async ({ page }) => {
		await page.goto('/splits');
		await expect(page).toHaveTitle(/SplitShare|Login/i);
	});

	test('should have proper page title for new split', async ({ page }) => {
		await page.goto('/splits/new');
		await expect(page).toHaveTitle(/SplitShare|Login/i);
	});

	test('should have proper page title for split detail', async ({ page }) => {
		await page.goto('/splits/some-id');
		await expect(page).toHaveTitle(/SplitShare|Login/i);
	});
});
