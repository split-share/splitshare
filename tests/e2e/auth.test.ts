import { expect, test } from '@playwright/test';

test.describe('Authentication Pages', () => {
	test.describe('Login Page', () => {
		test('should display login form with all required fields', async ({ page }) => {
			await page.goto('/login');

			// Check page title
			await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

			// Check form fields exist
			await expect(page.getByLabel('Email')).toBeVisible();
			await expect(page.getByLabel('Password')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

			// Check signup link
			await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
		});

		test('should navigate to register page from login', async ({ page }) => {
			await page.goto('/login');

			await page.getByRole('link', { name: 'Sign up' }).click();
			await expect(page).toHaveURL('/register');
		});

		test('should show validation for empty form submission', async ({ page }) => {
			await page.goto('/login');

			// Try to submit empty form - browser validation should prevent this
			const emailInput = page.getByLabel('Email');
			await expect(emailInput).toHaveAttribute('required', '');
		});

		test('should show error message for invalid credentials', async ({ page }) => {
			await page.goto('/login');

			await page.getByLabel('Email').fill('invalid@example.com');
			await page.getByLabel('Password').fill('wrongpassword123');
			await page.getByRole('button', { name: 'Login' }).click();

			// Wait for error message to appear
			await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe('Register Page', () => {
		test('should display signup form with all required fields', async ({ page }) => {
			await page.goto('/register');

			// Check page title
			await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();

			// Check form fields exist
			await expect(page.getByLabel('Full Name')).toBeVisible();
			await expect(page.getByLabel('Email')).toBeVisible();
			await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
			await expect(page.getByLabel('Confirm Password')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

			// Check login link
			await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
		});

		test('should navigate to login page from register', async ({ page }) => {
			await page.goto('/register');

			await page.getByRole('link', { name: 'Sign in' }).click();
			await expect(page).toHaveURL('/login');
		});

		test('should show error for password mismatch', async ({ page }) => {
			await page.goto('/register');

			await page.getByLabel('Full Name').fill('Test User');
			await page.getByLabel('Email').fill('test@example.com');
			await page.getByLabel('Password', { exact: true }).fill('Password123');
			await page.getByLabel('Confirm Password').fill('DifferentPassword123');
			await page.getByRole('button', { name: 'Create Account' }).click();

			// Should show password mismatch error
			await expect(page.getByRole('alert')).toContainText('Passwords do not match');
		});

		test('should show error for short password', async ({ page }) => {
			await page.goto('/register');

			await page.getByLabel('Full Name').fill('Test User');
			await page.getByLabel('Email').fill('test@example.com');
			await page.getByLabel('Password', { exact: true }).fill('short');
			await page.getByLabel('Confirm Password').fill('short');
			await page.getByRole('button', { name: 'Create Account' }).click();

			// Should show password length error
			await expect(page.getByRole('alert')).toContainText('at least 8 characters');
		});
	});
});
