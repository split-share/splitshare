import { describe, it, expect } from 'vitest';
import { PersonalRecord } from '../../../src/core/domain/workout/personal-record.entity';

describe('PersonalRecord Entity', () => {
	it('should create personal record entity', () => {
		const pr = new PersonalRecord(
			'pr-1',
			'user-1',
			'ex-1',
			100,
			10,
			new Date(),
			new Date(),
			new Date()
		);

		expect(pr.id).toBe('pr-1');
		expect(pr.weight).toBe(100);
		expect(pr.reps).toBe(10);
	});

	it('should calculate 1RM correctly using Epley formula', () => {
		const pr = new PersonalRecord(
			'pr-1',
			'user-1',
			'ex-1',
			100,
			10,
			new Date(),
			new Date(),
			new Date()
		);

		const oneRM = pr.calculateOneRepMax();
		expect(oneRM).toBeCloseTo(133.33, 1);
	});

	it('should update record', () => {
		const pr = new PersonalRecord(
			'pr-1',
			'user-1',
			'ex-1',
			100,
			10,
			new Date(),
			new Date(),
			new Date()
		);

		const newDate = new Date();
		pr.updateRecord(120, 8, newDate);

		expect(pr.weight).toBe(120);
		expect(pr.reps).toBe(8);
	});

	it('should throw error for negative weight', () => {
		const pr = new PersonalRecord(
			'pr-1',
			'user-1',
			'ex-1',
			100,
			10,
			new Date(),
			new Date(),
			new Date()
		);

		expect(() => pr.updateRecord(-10, 10, new Date())).toThrow('Weight cannot be negative');
	});

	it('should throw error for zero reps', () => {
		const pr = new PersonalRecord(
			'pr-1',
			'user-1',
			'ex-1',
			100,
			10,
			new Date(),
			new Date(),
			new Date()
		);

		expect(() => pr.updateRecord(100, 0, new Date())).toThrow('Reps must be at least 1');
	});
});
