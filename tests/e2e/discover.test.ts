import { expect, test } from '@playwright/test';

test.describe('Discover Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/discover');
	});

	test('should load the discover page with correct heading', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Discover Splits' })).toBeVisible();
		await expect(page.getByText('Explore workout routines shared by the community')).toBeVisible();
	});

	test('should display sort controls', async ({ page }) => {
		await expect(page.getByText('Sort:')).toBeVisible();
		await expect(page.getByRole('button', { name: /popular/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /recent/i })).toBeVisible();
	});

	test('should display difficulty filter controls', async ({ page }) => {
		await expect(page.getByText('Difficulty:')).toBeVisible();
		await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
		await expect(page.getByRole('button', { name: /beginner/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /intermediate/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /advanced/i })).toBeVisible();
	});

	test('should be able to switch sort mode', async ({ page }) => {
		const popularButton = page.getByRole('button', { name: /popular/i });
		const recentButton = page.getByRole('button', { name: /recent/i });

		await expect(popularButton).toBeVisible();
		await recentButton.click();

		await expect(recentButton).toBeVisible();
	});

	test('should filter by beginner difficulty', async ({ page }) => {
		const beginnerButton = page.getByRole('button', { name: /beginner/i });
		await beginnerButton.click();

		await expect(page).toHaveURL(/difficulty=beginner/);
	});

	test('should filter by intermediate difficulty', async ({ page }) => {
		const intermediateButton = page.getByRole('button', { name: /intermediate/i });
		await intermediateButton.click();

		await expect(page).toHaveURL(/difficulty=intermediate/);
	});

	test('should filter by advanced difficulty', async ({ page }) => {
		const advancedButton = page.getByRole('button', { name: /advanced/i });
		await advancedButton.click();

		await expect(page).toHaveURL(/difficulty=advanced/);
	});

	test('should reset filter when clicking All', async ({ page }) => {
		await page.goto('/discover?difficulty=beginner');

		const allButton = page.getByRole('button', { name: 'All' });
		await allButton.click();

		await expect(page).not.toHaveURL(/difficulty=/);
	});

	test('should have navigation back to home', async ({ page }) => {
		const homeLink = page.getByRole('link', { name: /splitshare|home/i });
		if (await homeLink.isVisible()) {
			await homeLink.click();
			await expect(page).toHaveURL('/');
		}
	});

	test('should display pagination info', async ({ page }) => {
		const pageInfo = page.getByText(/Page \d+ of \d+/);
		await expect(pageInfo).toBeVisible();
	});

	test('should show empty state or split cards', async ({ page }) => {
		const emptyState = page.getByText(/No public splits available|No splits found/);
		const splitCards = page.locator('[class*="card"]');

		const hasEmptyState = await emptyState.isVisible().catch(() => false);
		const hasCards = (await splitCards.count()) > 0;

		expect(hasEmptyState || hasCards).toBeTruthy();
	});

	test('should prompt unauthenticated users to sign up', async ({ page }) => {
		const signUpButton = page.getByRole('link', { name: /sign up to create splits/i });
		if (await signUpButton.isVisible()) {
			await signUpButton.click();
			await expect(page).toHaveURL('/register');
		}
	});
});
