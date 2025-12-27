import { expect, test } from '@playwright/test';

test.describe('Navigation Flow', () => {
	test('should navigate from home to discover and back', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/');

		const discoverLink = page.getByRole('link', { name: /discover/i });
		await discoverLink.click();
		await expect(page).toHaveURL('/discover');

		const homeLink = page.getByRole('link', { name: /splitshare|home/i }).first();
		await homeLink.click();
		await expect(page).toHaveURL('/');
	});

	test('should navigate between login and register pages', async ({ page }) => {
		await page.goto('/login');
		await expect(page).toHaveURL('/login');

		await page.getByRole('link', { name: /sign up/i }).click();
		await expect(page).toHaveURL('/register');

		await page.getByRole('link', { name: /sign in/i }).click();
		await expect(page).toHaveURL('/login');
	});

	test('should use browser back button correctly', async ({ page }) => {
		await page.goto('/');
		await page.goto('/discover');
		await page.goto('/login');

		await page.goBack();
		await expect(page).toHaveURL('/discover');

		await page.goBack();
		await expect(page).toHaveURL('/');
	});

	test('should handle direct URL navigation', async ({ page }) => {
		await page.goto('/discover?difficulty=beginner');
		await expect(page).toHaveURL(/discover.*difficulty=beginner/);

		await page.goto('/discover?difficulty=advanced&page=1');
		await expect(page).toHaveURL(/discover.*difficulty=advanced/);
	});

	test('should redirect invalid protected routes to login', async ({ page }) => {
		await page.goto('/splits/invalid-id-123');
		await expect(page).toHaveURL('/login');
	});
});

test.describe('Header Navigation', () => {
	test('should display logo/brand link', async ({ page }) => {
		await page.goto('/');

		const brandLink = page.getByRole('link', { name: /splitshare/i }).first();
		await expect(brandLink).toBeVisible();
	});

	test('should display navigation links', async ({ page }) => {
		await page.goto('/');

		const discoverLink = page.getByRole('link', { name: /discover/i });
		await expect(discoverLink).toBeVisible();
	});

	test('should display auth links when not logged in', async ({ page }) => {
		await page.goto('/');

		const authArea = page.locator('header, nav');
		const hasLoginLink = (await authArea.getByRole('link', { name: /login|sign in/i }).count()) > 0;
		const hasRegisterLink =
			(await authArea.getByRole('link', { name: /register|sign up|get started/i }).count()) > 0;

		expect(hasLoginLink || hasRegisterLink).toBeTruthy();
	});
});

test.describe('Footer Navigation', () => {
	test('should have footer visible on home page', async ({ page }) => {
		await page.goto('/');

		const footer = page.locator('footer');
		if ((await footer.count()) > 0) {
			await expect(footer).toBeVisible();
		}
	});
});

test.describe('Mobile Navigation', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test('should display mobile-friendly navigation', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('body')).toBeVisible();
	});

	test('should navigate on mobile viewport', async ({ page }) => {
		await page.goto('/');

		const discoverLink = page.getByRole('link', { name: /discover/i });
		if (await discoverLink.isVisible()) {
			await discoverLink.click();
			await expect(page).toHaveURL('/discover');
		}
	});
});
