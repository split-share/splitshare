import { expect, test } from '@playwright/test';

test.describe('Protected Routes - Unauthenticated Access', () => {
	test('should redirect /dashboard to login', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /splits to login', async ({ page }) => {
		await page.goto('/splits');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /splits/new to login', async ({ page }) => {
		await page.goto('/splits/new');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /workout to login', async ({ page }) => {
		await page.goto('/workout');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /stats to login', async ({ page }) => {
		await page.goto('/stats');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /log-workout to login', async ({ page }) => {
		await page.goto('/log-workout');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /exercises/new to login', async ({ page }) => {
		await page.goto('/exercises/new');
		await expect(page).toHaveURL('/login');
	});

	test('should redirect /forum to login', async ({ page }) => {
		await page.goto('/forum');
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Public Routes - Should Not Redirect', () => {
	test('should allow access to home page', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/');
	});

	test('should allow access to discover page', async ({ page }) => {
		await page.goto('/discover');
		await expect(page).toHaveURL('/discover');
	});

	test('should allow access to login page', async ({ page }) => {
		await page.goto('/login');
		await expect(page).toHaveURL('/login');
	});

	test('should allow access to register page', async ({ page }) => {
		await page.goto('/register');
		await expect(page).toHaveURL('/register');
	});
});
