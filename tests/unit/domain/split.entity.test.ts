import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Split } from '../../../src/core/domain/split/split.entity';

describe('Split Entity', () => {
	let split: Split;
	const now = new Date('2024-01-15T10:00:00Z');

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		split = new Split(
			'split-1',
			'user-1',
			'Push Pull Legs',
			'A classic 3-day split',
			true,
			false,
			'intermediate',
			3,
			null,
			['strength', 'hypertrophy'],
			now,
			now
		);
	});

	describe('constructor', () => {
		it('should create a split with all properties', () => {
			expect(split.id).toBe('split-1');
			expect(split.userId).toBe('user-1');
			expect(split.title).toBe('Push Pull Legs');
			expect(split.description).toBe('A classic 3-day split');
			expect(split.isPublic).toBe(true);
			expect(split.isDefault).toBe(false);
			expect(split.difficulty).toBe('intermediate');
			expect(split.duration).toBe(3);
			expect(split.imageUrl).toBeNull();
			expect(split.tags).toEqual(['strength', 'hypertrophy']);
			expect(split.createdAt).toEqual(now);
			expect(split.updatedAt).toEqual(now);
		});

		it('should create a split with minimal properties', () => {
			const minimalSplit = new Split(
				'split-2',
				'user-2',
				'Minimal Split',
				null,
				false,
				false,
				'beginner',
				null,
				null,
				null,
				now,
				now
			);

			expect(minimalSplit.description).toBeNull();
			expect(minimalSplit.duration).toBeNull();
			expect(minimalSplit.imageUrl).toBeNull();
			expect(minimalSplit.tags).toBeNull();
		});
	});

	describe('update', () => {
		it('should update title', () => {
			const newTime = new Date('2024-01-15T11:00:00Z');
			vi.setSystemTime(newTime);

			split.update({ title: 'Updated Title' });

			expect(split.title).toBe('Updated Title');
			expect(split.updatedAt).toEqual(newTime);
		});

		it('should update description', () => {
			split.update({ description: 'New description' });
			expect(split.description).toBe('New description');
		});

		it('should update description to null', () => {
			split.update({ description: null });
			expect(split.description).toBeNull();
		});

		it('should update isPublic', () => {
			split.update({ isPublic: false });
			expect(split.isPublic).toBe(false);
		});

		it('should update difficulty', () => {
			split.update({ difficulty: 'advanced' });
			expect(split.difficulty).toBe('advanced');
		});

		it('should update duration', () => {
			split.update({ duration: 5 });
			expect(split.duration).toBe(5);
		});

		it('should update duration to null', () => {
			split.update({ duration: null });
			expect(split.duration).toBeNull();
		});

		it('should update imageUrl', () => {
			split.update({ imageUrl: 'https://example.com/image.jpg' });
			expect(split.imageUrl).toBe('https://example.com/image.jpg');
		});

		it('should update imageUrl to null', () => {
			split.update({ imageUrl: null });
			expect(split.imageUrl).toBeNull();
		});

		it('should update tags', () => {
			split.update({ tags: ['powerlifting', 'strength'] });
			expect(split.tags).toEqual(['powerlifting', 'strength']);
		});

		it('should update tags to null', () => {
			split.update({ tags: null });
			expect(split.tags).toBeNull();
		});

		it('should update multiple properties at once', () => {
			const newTime = new Date('2024-01-15T12:00:00Z');
			vi.setSystemTime(newTime);

			split.update({
				title: 'New Title',
				description: 'New Description',
				difficulty: 'beginner',
				isPublic: false
			});

			expect(split.title).toBe('New Title');
			expect(split.description).toBe('New Description');
			expect(split.difficulty).toBe('beginner');
			expect(split.isPublic).toBe(false);
			expect(split.updatedAt).toEqual(newTime);
		});

		it('should not update properties that are not provided', () => {
			const originalTitle = split.title;
			const originalDescription = split.description;

			split.update({ isPublic: false });

			expect(split.title).toBe(originalTitle);
			expect(split.description).toBe(originalDescription);
		});

		it('should always update updatedAt timestamp', () => {
			const newTime = new Date('2024-01-15T13:00:00Z');
			vi.setSystemTime(newTime);

			split.update({});

			expect(split.updatedAt).toEqual(newTime);
		});
	});

});
