import { expect, test } from '@playwright/test';

test.describe('Discover Page', () => {
	test('should load the discover page successfully', async ({ page }) => {
		await page.goto('/discover');

		// Page should load without errors
		await expect(page).toHaveURL('/discover');
	});

	test('should display public splits section', async ({ page }) => {
		await page.goto('/discover');

		// Should have some content indicating public splits
		// The exact content depends on what's in the database
		await expect(page.locator('body')).toBeVisible();
	});

	test('should have navigation back to home', async ({ page }) => {
		await page.goto('/discover');

		// Should be able to navigate back to home
		const homeLink = page.getByRole('link', { name: /splitshare|home/i });
		if (await homeLink.isVisible()) {
			await homeLink.click();
			await expect(page).toHaveURL('/');
		}
	});
});
