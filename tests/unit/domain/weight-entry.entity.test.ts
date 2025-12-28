import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeightEntry } from '../../../src/core/domain/weight/weight-entry.entity';

describe('WeightEntry Entity', () => {
	let weightEntry: WeightEntry;
	const now = new Date('2024-01-15T10:00:00Z');
	const recordedAt = new Date('2024-01-15T08:00:00Z');

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		weightEntry = new WeightEntry(
			'weight-1',
			'user-1',
			180.5,
			recordedAt,
			'Feeling good',
			now,
			now
		);
	});

	describe('constructor', () => {
		it('should create a weight entry with all properties', () => {
			expect(weightEntry.id).toBe('weight-1');
			expect(weightEntry.userId).toBe('user-1');
			expect(weightEntry.weight).toBe(180.5);
			expect(weightEntry.recordedAt).toEqual(recordedAt);
			expect(weightEntry.notes).toBe('Feeling good');
			expect(weightEntry.createdAt).toEqual(now);
			expect(weightEntry.updatedAt).toEqual(now);
		});

		it('should create a weight entry without notes', () => {
			const minimalEntry = new WeightEntry('weight-2', 'user-2', 175.0, recordedAt, null, now, now);

			expect(minimalEntry.notes).toBeNull();
		});

		it('should accept decimal weights', () => {
			const decimalEntry = new WeightEntry(
				'weight-3',
				'user-3',
				165.25,
				recordedAt,
				null,
				now,
				now
			);

			expect(decimalEntry.weight).toBe(165.25);
		});

		it('should accept integer weights', () => {
			const integerEntry = new WeightEntry('weight-4', 'user-4', 200, recordedAt, null, now, now);

			expect(integerEntry.weight).toBe(200);
		});
	});

	describe('update', () => {
		it('should update weight', () => {
			const newTime = new Date('2024-01-15T11:00:00Z');
			vi.setSystemTime(newTime);

			weightEntry.update({ weight: 182.0 });

			expect(weightEntry.weight).toBe(182.0);
			expect(weightEntry.updatedAt).toEqual(newTime);
		});

		it('should update recordedAt', () => {
			const newRecordedAt = new Date('2024-01-16T08:00:00Z');
			weightEntry.update({ recordedAt: newRecordedAt });

			expect(weightEntry.recordedAt).toEqual(newRecordedAt);
		});

		it('should update notes', () => {
			weightEntry.update({ notes: 'New notes' });
			expect(weightEntry.notes).toBe('New notes');
		});

		it('should update notes to null', () => {
			weightEntry.update({ notes: null });
			expect(weightEntry.notes).toBeNull();
		});

		it('should update multiple properties at once', () => {
			const newTime = new Date('2024-01-15T12:00:00Z');
			const newRecordedAt = new Date('2024-01-16T09:00:00Z');
			vi.setSystemTime(newTime);

			weightEntry.update({
				weight: 185.5,
				recordedAt: newRecordedAt,
				notes: 'Updated notes'
			});

			expect(weightEntry.weight).toBe(185.5);
			expect(weightEntry.recordedAt).toEqual(newRecordedAt);
			expect(weightEntry.notes).toBe('Updated notes');
			expect(weightEntry.updatedAt).toEqual(newTime);
		});

		it('should not update properties that are not provided', () => {
			const originalWeight = weightEntry.weight;
			const originalRecordedAt = weightEntry.recordedAt;

			weightEntry.update({ notes: 'New notes only' });

			expect(weightEntry.weight).toBe(originalWeight);
			expect(weightEntry.recordedAt).toEqual(originalRecordedAt);
		});

		it('should always update updatedAt timestamp', () => {
			const newTime = new Date('2024-01-15T13:00:00Z');
			vi.setSystemTime(newTime);

			weightEntry.update({});

			expect(weightEntry.updatedAt).toEqual(newTime);
		});

		it('should accept decimal weights on update', () => {
			weightEntry.update({ weight: 179.75 });
			expect(weightEntry.weight).toBe(179.75);
		});
	});

});
