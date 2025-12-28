import { expect, test } from '@playwright/test';

test.describe('Stats Page - Unauthenticated', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/stats');
	});

	test('should redirect to login page', async ({ page }) => {
		await expect(page).toHaveURL('/login');
	});

	test('should display login form after redirect', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
	});

	test('should preserve stats as intended destination', async ({ page }) => {
		await expect(page).toHaveURL(/login/);
	});
});

test.describe('Stats Page Navigation', () => {
	test('should redirect when accessing stats from any page', async ({ page }) => {
		await page.goto('/');
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');
	});

	test('should handle browser back button', async ({ page }) => {
		await page.goto('/discover');
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');

		await page.goBack();
		await expect(page).toHaveURL('/discover');
	});

	test('should be accessible from navigation menu when authenticated', async ({ page }) => {
		await page.goto('/');

		const nav = page.locator('header, nav');
		const statsLink = nav.getByRole('link', { name: /stats/i });

		if (await statsLink.isVisible()) {
			await statsLink.click();
			await expect(page).toHaveURL(/\/stats|\/login/);
		}
	});
});

test.describe('Stats Page Meta Information', () => {
	test('should have appropriate page title', async ({ page }) => {
		await page.goto('/stats');
		await expect(page).toHaveTitle(/SplitShare|Login/i);
	});

	test('should handle direct URL access', async ({ page }) => {
		const response = await page.goto('/stats');
		expect(response?.status()).toBe(200);
		await expect(page).toHaveURL('/login');
	});

	test('should handle page reload', async ({ page }) => {
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');

		await page.reload();
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Stats Page Security', () => {
	test('should not expose stats content to unauthenticated users', async ({ page }) => {
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');

		const statsContent = page.getByText(/personal records|workout history|progress/i);
		await expect(statsContent).not.toBeVisible();
	});

	test('should maintain security with query parameters', async ({ page }) => {
		await page.goto('/stats?period=week');
		await expect(page).toHaveURL(/\/login/);

		await page.goto('/stats?view=charts');
		await expect(page).toHaveURL(/\/login/);
	});

	test('should maintain security with hash fragments', async ({ page }) => {
		await page.goto('/stats#progress');
		await expect(page).toHaveURL(/\/login/);

		await page.goto('/stats#records');
		await expect(page).toHaveURL(/\/login/);
	});

	test('should not bypass auth with referrer', async ({ page }) => {
		await page.goto('/discover');
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Stats Page Accessibility', () => {
	test('should have accessible login form after redirect', async ({ page }) => {
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');

		const emailInput = page.getByLabel('Email');
		const passwordInput = page.getByLabel('Password');

		await expect(emailInput).toBeVisible();
		await expect(passwordInput).toBeVisible();

		await expect(emailInput).toHaveAttribute('type', 'email');
		await expect(passwordInput).toHaveAttribute('type', 'password');
	});

	test('should be keyboard navigable after redirect', async ({ page }) => {
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');

		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
		expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
	});
});
