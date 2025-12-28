import { describe, it, expect } from 'vitest';
import { updateProfileSchema } from '$lib/schemas/profile';

describe('updateProfileSchema', () => {
	it('should accept valid name', () => {
		const result = updateProfileSchema.safeParse({ name: 'John Doe' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('John Doe');
		}
	});

	it('should trim whitespace from name', () => {
		const result = updateProfileSchema.safeParse({ name: '  John Doe  ' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('John Doe');
		}
	});

	it('should reject name shorter than 2 characters', () => {
		const result = updateProfileSchema.safeParse({ name: 'A' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('at least 2');
		}
	});

	it('should reject name longer than 100 characters', () => {
		const result = updateProfileSchema.safeParse({ name: 'A'.repeat(101) });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain('at most 100');
		}
	});

	it('should accept name at minimum length (2 characters)', () => {
		const result = updateProfileSchema.safeParse({ name: 'Jo' });
		expect(result.success).toBe(true);
	});

	it('should accept name at maximum length (100 characters)', () => {
		const result = updateProfileSchema.safeParse({ name: 'A'.repeat(100) });
		expect(result.success).toBe(true);
	});

	it('should reject empty name', () => {
		const result = updateProfileSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('should reject whitespace-only name', () => {
		const result = updateProfileSchema.safeParse({ name: '   ' });
		expect(result.success).toBe(false);
	});
});
