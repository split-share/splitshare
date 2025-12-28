import { describe, it, expect } from 'vitest';
import {
	totpCodeSchema,
	backupCodeSchema,
	enableTwoFactorSchema,
	disableTwoFactorSchema
} from '$lib/schemas/two-factor';

describe('totpCodeSchema', () => {
	it('should accept valid 6-digit code', () => {
		const result = totpCodeSchema.safeParse({ code: '123456' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.code).toBe('123456');
		}
	});

	it('should reject code shorter than 6 digits', () => {
		const result = totpCodeSchema.safeParse({ code: '12345' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('6');
		}
	});

	it('should reject code longer than 6 digits', () => {
		const result = totpCodeSchema.safeParse({ code: '1234567' });
		expect(result.success).toBe(false);
	});

	it('should reject code with non-numeric characters', () => {
		const result = totpCodeSchema.safeParse({ code: '12345a' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('numbers');
		}
	});

	it('should reject empty code', () => {
		const result = totpCodeSchema.safeParse({ code: '' });
		expect(result.success).toBe(false);
	});
});

describe('backupCodeSchema', () => {
	it('should accept valid 8-character alphanumeric code', () => {
		const result = backupCodeSchema.safeParse({ code: 'ABCD1234' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.code).toBe('ABCD1234');
		}
	});

	it('should reject code shorter than 8 characters', () => {
		const result = backupCodeSchema.safeParse({ code: 'ABCD123' });
		expect(result.success).toBe(false);
	});

	it('should reject code longer than 8 characters', () => {
		const result = backupCodeSchema.safeParse({ code: 'ABCD12345' });
		expect(result.success).toBe(false);
	});

	it('should reject code with lowercase letters', () => {
		const result = backupCodeSchema.safeParse({ code: 'abcd1234' });
		expect(result.success).toBe(false);
	});

	it('should reject code with special characters', () => {
		const result = backupCodeSchema.safeParse({ code: 'ABCD-123' });
		expect(result.success).toBe(false);
	});

	it('should accept all-numeric code', () => {
		const result = backupCodeSchema.safeParse({ code: '12345678' });
		expect(result.success).toBe(true);
	});

	it('should accept all-uppercase code', () => {
		const result = backupCodeSchema.safeParse({ code: 'ABCDEFGH' });
		expect(result.success).toBe(true);
	});
});

describe('enableTwoFactorSchema', () => {
	it('should accept valid password', () => {
		const result = enableTwoFactorSchema.safeParse({ password: 'myPassword123' });
		expect(result.success).toBe(true);
	});

	it('should reject empty password', () => {
		const result = enableTwoFactorSchema.safeParse({ password: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('required');
		}
	});
});

describe('disableTwoFactorSchema', () => {
	it('should accept valid password', () => {
		const result = disableTwoFactorSchema.safeParse({ password: 'myPassword123' });
		expect(result.success).toBe(true);
	});

	it('should reject empty password', () => {
		const result = disableTwoFactorSchema.safeParse({ password: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('required');
		}
	});
});
