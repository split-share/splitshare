import { describe, it, expect } from 'vitest';
import { Comment } from '../../../src/core/domain/split/comment.entity';

describe('Comment Entity', () => {
	it('should create comment entity', () => {
		const comment = new Comment(
			'comment-1',
			'user-1',
			'split-1',
			'Great workout!',
			new Date(),
			new Date()
		);

		expect(comment.id).toBe('comment-1');
		expect(comment.userId).toBe('user-1');
		expect(comment.splitId).toBe('split-1');
		expect(comment.content).toBe('Great workout!');
	});

	it('should update comment content', () => {
		const comment = new Comment(
			'comment-1',
			'user-1',
			'split-1',
			'Great workout!',
			new Date(),
			new Date()
		);

		comment.updateContent('Amazing split!');

		expect(comment.content).toBe('Amazing split!');
	});

	it('should throw error for empty content', () => {
		expect(() => Comment.validateContent('')).toThrow('Comment content is required');
	});

	it('should throw error for whitespace-only content', () => {
		expect(() => Comment.validateContent('   ')).toThrow('Comment content is required');
	});

	it('should throw error for content exceeding 1000 characters', () => {
		const longContent = 'a'.repeat(1001);
		expect(() => Comment.validateContent(longContent)).toThrow(
			'Comment content must be less than 1000 characters'
		);
	});

	it('should throw error for empty userId', () => {
		expect(() => Comment.validateUserId('')).toThrow('User ID is required');
	});

	it('should throw error for empty splitId', () => {
		expect(() => Comment.validateSplitId('')).toThrow('Split ID is required');
	});

	it('should throw error when updating with invalid content', () => {
		const comment = new Comment(
			'comment-1',
			'user-1',
			'split-1',
			'Great workout!',
			new Date(),
			new Date()
		);

		expect(() => comment.updateContent('')).toThrow('Comment content is required');
	});
});
