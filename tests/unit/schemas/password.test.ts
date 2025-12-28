import { describe, it, expect } from 'vitest';
import { changePasswordSchema } from '$lib/schemas/password';

describe('changePasswordSchema', () => {
	const validInput = {
		currentPassword: 'OldPass123',
		newPassword: 'NewPass456',
		confirmPassword: 'NewPass456'
	};

	describe('currentPassword', () => {
		it('should accept non-empty current password', () => {
			const result = changePasswordSchema.safeParse(validInput);
			expect(result.success).toBe(true);
		});

		it('should reject empty current password', () => {
			const result = changePasswordSchema.safeParse({
				...validInput,
				currentPassword: ''
			});
			expect(result.success).toBe(false);
		});
	});

	describe('newPassword', () => {
		it('should accept valid password with all requirements', () => {
			const result = changePasswordSchema.safeParse(validInput);
			expect(result.success).toBe(true);
		});

		it('should reject password shorter than 8 characters', () => {
			const result = changePasswordSchema.safeParse({
				...validInput,
				newPassword: 'Short1',
				confirmPassword: 'Short1'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('at least 8');
			}
		});

		it('should reject password without uppercase letter', () => {
			const result = changePasswordSchema.safeParse({
				...validInput,
				newPassword: 'lowercase123',
				confirmPassword: 'lowercase123'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('uppercase');
			}
		});

		it('should reject password without lowercase letter', () => {
			const result = changePasswordSchema.safeParse({
				...validInput,
				newPassword: 'UPPERCASE123',
				confirmPassword: 'UPPERCASE123'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('lowercase');
			}
		});

		it('should reject password without number', () => {
			const result = changePasswordSchema.safeParse({
				...validInput,
				newPassword: 'NoNumbersHere',
				confirmPassword: 'NoNumbersHere'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('number');
			}
		});
	});

	describe('confirmPassword', () => {
		it('should reject when passwords do not match', () => {
			const result = changePasswordSchema.safeParse({
				...validInput,
				confirmPassword: 'DifferentPass789'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'));
				expect(confirmError?.message).toContain("don't match");
			}
		});
	});

	describe('same password validation', () => {
		it('should reject when new password is same as current password', () => {
			const result = changePasswordSchema.safeParse({
				currentPassword: 'SamePass123',
				newPassword: 'SamePass123',
				confirmPassword: 'SamePass123'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const sameError = result.error.issues.find((i) => i.path.includes('newPassword'));
				expect(sameError?.message).toContain('different');
			}
		});
	});
});
