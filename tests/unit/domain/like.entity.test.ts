import { describe, it, expect } from 'vitest';
import { Like } from '../../../src/core/domain/split/like.entity';

describe('Like Entity', () => {
	it('should create like entity', () => {
		const like = new Like('like-1', 'user-1', 'split-1', new Date());

		expect(like.id).toBe('like-1');
		expect(like.userId).toBe('user-1');
		expect(like.splitId).toBe('split-1');
	});

	it('should throw error for empty userId', () => {
		expect(() => Like.validateUserId('')).toThrow('User ID is required');
	});

	it('should throw error for whitespace-only userId', () => {
		expect(() => Like.validateUserId('   ')).toThrow('User ID is required');
	});

	it('should throw error for empty splitId', () => {
		expect(() => Like.validateSplitId('')).toThrow('Split ID is required');
	});

	it('should throw error for whitespace-only splitId', () => {
		expect(() => Like.validateSplitId('   ')).toThrow('Split ID is required');
	});
});
