import { expect, test } from '@playwright/test';

test.describe('Settings Pages', () => {
	test.describe('Two-Factor Verification Page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/two-factor');
		});

		test('should display two-factor verification form', async ({ page }) => {
			await expect(page.getByRole('heading', { name: 'Two-Factor Authentication' })).toBeVisible();
			await expect(page.getByLabel(/Verification Code|Backup Code/)).toBeVisible();
			await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
		});

		test('should have checkbox for trusting device', async ({ page }) => {
			await expect(page.getByText('Trust this device for 30 days')).toBeVisible();
		});

		test('should have link to use backup code', async ({ page }) => {
			await expect(page.getByText('Use a backup code instead')).toBeVisible();
		});

		test('should switch to backup code mode when clicked', async ({ page }) => {
			await page.getByText('Use a backup code instead').click();
			await expect(page.getByText('Enter one of your backup codes')).toBeVisible();
			await expect(page.getByText('Use authenticator app')).toBeVisible();
		});

		test('should switch back to TOTP mode', async ({ page }) => {
			await page.getByText('Use a backup code instead').click();
			await page.getByText('Use authenticator app').click();
			await expect(page.getByText('Enter the 6-digit code')).toBeVisible();
		});

		test('should only accept numeric input in TOTP mode', async ({ page }) => {
			const input = page.getByLabel('Verification Code');
			await input.fill('abc123');
			const value = await input.inputValue();
			expect(value).toBe('123');
		});

		test('should limit TOTP code to 6 digits', async ({ page }) => {
			const input = page.getByLabel('Verification Code');
			await input.fill('1234567890');
			const value = await input.inputValue();
			expect(value).toBe('123456');
		});

		test('should limit backup code to 8 characters', async ({ page }) => {
			await page.getByText('Use a backup code instead').click();
			const input = page.getByLabel('Backup Code');
			await input.fill('ABCD12345678');
			const value = await input.inputValue();
			expect(value).toBe('ABCD1234');
		});

		test('should convert backup code to uppercase', async ({ page }) => {
			await page.getByText('Use a backup code instead').click();
			const input = page.getByLabel('Backup Code');
			await input.fill('abcd1234');
			const value = await input.inputValue();
			expect(value).toBe('ABCD1234');
		});

		test('verify button should be disabled with incomplete TOTP code', async ({ page }) => {
			const input = page.getByLabel('Verification Code');
			await input.fill('12345');
			const verifyButton = page.getByRole('button', { name: 'Verify' });
			await expect(verifyButton).toBeDisabled();
		});

		test('verify button should be enabled with complete TOTP code', async ({ page }) => {
			const input = page.getByLabel('Verification Code');
			await input.fill('123456');
			const verifyButton = page.getByRole('button', { name: 'Verify' });
			await expect(verifyButton).toBeEnabled();
		});

		test('verify button should be disabled with incomplete backup code', async ({ page }) => {
			await page.getByText('Use a backup code instead').click();
			const input = page.getByLabel('Backup Code');
			await input.fill('ABC1234');
			const verifyButton = page.getByRole('button', { name: 'Verify' });
			await expect(verifyButton).toBeDisabled();
		});

		test('verify button should be enabled with complete backup code', async ({ page }) => {
			await page.getByText('Use a backup code instead').click();
			const input = page.getByLabel('Backup Code');
			await input.fill('ABCD1234');
			const verifyButton = page.getByRole('button', { name: 'Verify' });
			await expect(verifyButton).toBeEnabled();
		});

		test('should have autofocus on code input', async ({ page }) => {
			const input = page.getByLabel('Verification Code');
			await expect(input).toBeFocused();
		});

		test('should be keyboard navigable', async ({ page }) => {
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');

			const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
			expect(['INPUT', 'BUTTON']).toContain(focusedElement);
		});
	});

	test.describe('Settings Access Control', () => {
		test('should redirect unauthenticated users from settings/profile to login', async ({
			page
		}) => {
			await page.goto('/settings/profile');
			await expect(page).toHaveURL('/login');
		});

		test('should redirect unauthenticated users from settings/security to login', async ({
			page
		}) => {
			await page.goto('/settings/security');
			await expect(page).toHaveURL('/login');
		});
	});
});
