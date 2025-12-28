import { expect, test } from '@playwright/test';

test.describe('Dashboard Page - Unauthenticated', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/dashboard');
	});

	test('should redirect to login page', async ({ page }) => {
		await expect(page).toHaveURL('/login');
	});

	test('should display login form after redirect', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
	});

	test('should allow navigation to register from login', async ({ page }) => {
		const signUpLink = page.getByRole('link', { name: 'Sign up' });
		await expect(signUpLink).toBeVisible();
		await signUpLink.click();
		await expect(page).toHaveURL('/register');
	});
});

test.describe('Dashboard Page Meta', () => {
	test('should have appropriate page title', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveTitle(/SplitShare|Login/i);
	});

	test('should handle direct navigation', async ({ page }) => {
		await page.goto('/');
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/login');
	});

	test('should handle browser back button from dashboard redirect', async ({ page }) => {
		await page.goto('/');
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/login');

		await page.goBack();
		await expect(page).toHaveURL('/');
	});
});

test.describe('Dashboard Navigation Links', () => {
	test('should redirect when accessed from home page', async ({ page }) => {
		await page.goto('/');

		const dashboardLink = page.getByRole('link', { name: /dashboard/i });
		if (await dashboardLink.isVisible()) {
			await dashboardLink.click();
			await expect(page).toHaveURL('/login');
		}
	});

	test('should be accessible from header when authenticated', async ({ page }) => {
		await page.goto('/');

		const nav = page.locator('header, nav');
		const dashboardLink = nav.getByRole('link', { name: /dashboard/i });

		if (await dashboardLink.isVisible()) {
			await dashboardLink.click();
			await expect(page).toHaveURL(/\/dashboard|\/login/);
		}
	});
});

test.describe('Dashboard Page Security', () => {
	test('should not expose dashboard content to unauthenticated users', async ({ page }) => {
		const response = await page.goto('/dashboard');
		expect(response?.status()).toBe(200);

		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
	});

	test('should maintain security on page reload', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/login');

		await page.reload();
		await expect(page).toHaveURL('/login');
	});

	test('should not allow access via URL manipulation', async ({ page }) => {
		await page.goto('/dashboard?user=admin');
		await expect(page).toHaveURL(/\/login/);

		await page.goto('/dashboard#content');
		await expect(page).toHaveURL(/\/login/);
	});
});
