import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should load the home page with correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/SplitShare/i);
	});

	test('should display hero section', async ({ page }) => {
		const heroHeading = page.locator('h1, h2').first();
		await expect(heroHeading).toBeVisible();
	});

	test('should display features section', async ({ page }) => {
		await expect(page.getByText('Everything you need to level up')).toBeVisible();

		await expect(page.getByText('Custom Splits')).toBeVisible();
		await expect(page.getByText('Community')).toBeVisible();
		await expect(page.getByText('Easy Sharing')).toBeVisible();
		await expect(page.getByText('Trending Routines')).toBeVisible();
	});

	test('should display default workout splits section', async ({ page }) => {
		await expect(page.getByText('Default Workout Splits')).toBeVisible();
		await expect(page.getByText('Curated workout splits to get you started')).toBeVisible();
	});

	test('should navigate to discover page', async ({ page }) => {
		const discoverLink = page.getByRole('link', { name: /discover/i });
		await discoverLink.click();
		await expect(page).toHaveURL('/discover');
	});

	test('should have difficulty filter on home page', async ({ page }) => {
		const allButton = page.getByRole('button', { name: 'All' });
		const beginnerButton = page.getByRole('button', { name: /beginner/i });
		const intermediateButton = page.getByRole('button', { name: /intermediate/i });
		const advancedButton = page.getByRole('button', { name: /advanced/i });

		await expect(allButton).toBeVisible();
		await expect(beginnerButton).toBeVisible();
		await expect(intermediateButton).toBeVisible();
		await expect(advancedButton).toBeVisible();
	});

	test('should navigate to login page from auth link', async ({ page }) => {
		const loginLink = page.getByRole('link', { name: /login|sign in/i });
		if (await loginLink.isVisible()) {
			await loginLink.click();
			await expect(page).toHaveURL('/login');
		}
	});

	test('should navigate to register page from auth link', async ({ page }) => {
		const registerLink = page.getByRole('link', { name: /register|sign up|get started/i });
		if (await registerLink.isVisible()) {
			await registerLink.click();
			await expect(page).toHaveURL('/register');
		}
	});

	test('should navigate to forum from community feature', async ({ page }) => {
		const communityLink = page.getByRole('link', { name: /community/i });
		if (await communityLink.isVisible()) {
			await communityLink.click();
			await expect(page).toHaveURL(/\/forum|\/login/);
		}
	});
});
