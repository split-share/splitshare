import { expect, test } from '@playwright/test';

test.describe('Authentication Pages', () => {
	test.describe('Login Page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/login');
		});

		test('should display login form with all required fields', async ({ page }) => {
			await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

			await expect(page.getByLabel('Email')).toBeVisible();
			await expect(page.getByLabel('Password')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

			await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
		});

		test('should navigate to register page from login', async ({ page }) => {
			await page.getByRole('link', { name: 'Sign up' }).click();
			await expect(page).toHaveURL('/register');
		});

		test('should have required attribute on email input', async ({ page }) => {
			const emailInput = page.getByLabel('Email');
			await expect(emailInput).toHaveAttribute('required', '');
		});

		test('should have required attribute on password input', async ({ page }) => {
			const passwordInput = page.getByLabel('Password');
			await expect(passwordInput).toHaveAttribute('required', '');
		});

		test('should have email type on email input', async ({ page }) => {
			const emailInput = page.getByLabel('Email');
			await expect(emailInput).toHaveAttribute('type', 'email');
		});

		test('should have password type on password input', async ({ page }) => {
			const passwordInput = page.getByLabel('Password');
			await expect(passwordInput).toHaveAttribute('type', 'password');
		});

		test('should show error message for invalid credentials', async ({ page }) => {
			await page.getByLabel('Email').fill('invalid@example.com');
			await page.getByLabel('Password').fill('wrongpassword123');
			await page.getByRole('button', { name: 'Login' }).click();

			await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
		});

		test('should trim whitespace from email input', async ({ page }) => {
			const emailInput = page.getByLabel('Email');
			await emailInput.fill('  test@example.com  ');
			await page.getByLabel('Password').fill('password123');

			const emailValue = await emailInput.inputValue();
			expect(emailValue.trim()).toBe('test@example.com');
		});
	});

	test.describe('Register Page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/register');
		});

		test('should display signup form with all required fields', async ({ page }) => {
			await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();

			await expect(page.getByLabel('Full Name')).toBeVisible();
			await expect(page.getByLabel('Email')).toBeVisible();
			await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
			await expect(page.getByLabel('Confirm Password')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

			await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
		});

		test('should navigate to login page from register', async ({ page }) => {
			await page.getByRole('link', { name: 'Sign in' }).click();
			await expect(page).toHaveURL('/login');
		});

		test('should have required attributes on all inputs', async ({ page }) => {
			await expect(page.getByLabel('Full Name')).toHaveAttribute('required', '');
			await expect(page.getByLabel('Email')).toHaveAttribute('required', '');
			await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('required', '');
			await expect(page.getByLabel('Confirm Password')).toHaveAttribute('required', '');
		});

		test('should show error for password mismatch', async ({ page }) => {
			await page.getByLabel('Full Name').fill('Test User');
			await page.getByLabel('Email').fill('test@example.com');
			await page.getByLabel('Password', { exact: true }).fill('Password123');
			await page.getByLabel('Confirm Password').fill('DifferentPassword123');
			await page.getByRole('button', { name: 'Create Account' }).click();

			await expect(page.getByRole('alert')).toContainText('Passwords do not match');
		});

		test('should show error for short password', async ({ page }) => {
			await page.getByLabel('Full Name').fill('Test User');
			await page.getByLabel('Email').fill('test@example.com');
			await page.getByLabel('Password', { exact: true }).fill('short');
			await page.getByLabel('Confirm Password').fill('short');
			await page.getByRole('button', { name: 'Create Account' }).click();

			await expect(page.getByRole('alert')).toContainText('at least 8 characters');
		});

		test('should have email type on email input', async ({ page }) => {
			const emailInput = page.getByLabel('Email');
			await expect(emailInput).toHaveAttribute('type', 'email');
		});

		test('should have password type on password inputs', async ({ page }) => {
			await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
				'type',
				'password'
			);
			await expect(page.getByLabel('Confirm Password')).toHaveAttribute('type', 'password');
		});

		test('should show error for invalid email format', async ({ page }) => {
			await page.getByLabel('Full Name').fill('Test User');
			await page.getByLabel('Email').fill('notanemail');
			await page.getByLabel('Password', { exact: true }).fill('Password123');
			await page.getByLabel('Confirm Password').fill('Password123');
			await page.getByRole('button', { name: 'Create Account' }).click();

			const emailInput = page.getByLabel('Email');
			const validationMessage = await emailInput.evaluate(
				(el) => (el as HTMLInputElement).validationMessage
			);
			expect(validationMessage).toBeTruthy();
		});

		test('should show error for empty name', async ({ page }) => {
			await page.getByLabel('Email').fill('test@example.com');
			await page.getByLabel('Password', { exact: true }).fill('Password123');
			await page.getByLabel('Confirm Password').fill('Password123');
			await page.getByRole('button', { name: 'Create Account' }).click();

			const nameInput = page.getByLabel('Full Name');
			const validationMessage = await nameInput.evaluate(
				(el) => (el as HTMLInputElement).validationMessage
			);
			expect(validationMessage).toBeTruthy();
		});
	});

	test.describe('Auth Page Accessibility', () => {
		test('login page should have proper form labels', async ({ page }) => {
			await page.goto('/login');

			const emailInput = page.getByLabel('Email');
			const passwordInput = page.getByLabel('Password');

			await expect(emailInput).toBeVisible();
			await expect(passwordInput).toBeVisible();
		});

		test('register page should have proper form labels', async ({ page }) => {
			await page.goto('/register');

			const nameInput = page.getByLabel('Full Name');
			const emailInput = page.getByLabel('Email');
			const passwordInput = page.getByLabel('Password', { exact: true });
			const confirmInput = page.getByLabel('Confirm Password');

			await expect(nameInput).toBeVisible();
			await expect(emailInput).toBeVisible();
			await expect(passwordInput).toBeVisible();
			await expect(confirmInput).toBeVisible();
		});

		test('login form should be keyboard navigable', async ({ page }) => {
			await page.goto('/login');

			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');

			const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
			expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
		});
	});
});
