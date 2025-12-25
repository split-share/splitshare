import { describe, it, expect } from 'vitest';
import { DayExercise } from '../../../src/core/domain/split/day-exercise.entity';

describe('DayExercise Entity', () => {
	describe('Weight Validation', () => {
		it('should accept null weight', () => {
			expect(() => DayExercise.validateWeight(null)).not.toThrow();
		});

		it('should accept positive weight', () => {
			expect(() => DayExercise.validateWeight(50)).not.toThrow();
			expect(() => DayExercise.validateWeight(100.5)).not.toThrow();
			expect(() => DayExercise.validateWeight(0.5)).not.toThrow();
		});

		it('should throw error for zero weight', () => {
			expect(() => DayExercise.validateWeight(0)).toThrow('Weight must be positive');
		});

		it('should throw error for negative weight', () => {
			expect(() => DayExercise.validateWeight(-5)).toThrow('Weight must be positive');
			expect(() => DayExercise.validateWeight(-100.5)).toThrow('Weight must be positive');
		});
	});

	describe('Sets Validation', () => {
		it('should accept positive sets', () => {
			expect(() => DayExercise.validateSets(1)).not.toThrow();
			expect(() => DayExercise.validateSets(10)).not.toThrow();
		});

		it('should throw error for zero or negative sets', () => {
			expect(() => DayExercise.validateSets(0)).toThrow('Exercise must have at least 1 set');
			expect(() => DayExercise.validateSets(-1)).toThrow('Exercise must have at least 1 set');
		});
	});

	describe('Reps Validation', () => {
		it('should accept valid reps', () => {
			expect(() => DayExercise.validateReps('10')).not.toThrow();
			expect(() => DayExercise.validateReps('8-12')).not.toThrow();
			expect(() => DayExercise.validateReps('AMRAP')).not.toThrow();
		});

		it('should throw error for empty reps', () => {
			expect(() => DayExercise.validateReps('')).toThrow('Exercise reps are required');
			expect(() => DayExercise.validateReps('   ')).toThrow('Exercise reps are required');
		});
	});

	describe('Entity Creation', () => {
		it('should create day exercise with weight', () => {
			const dayExercise = new DayExercise(
				'ex-1',
				'day-1',
				'exercise-1',
				3,
				'8-12',
				60,
				0,
				'Focus on form',
				100,
				new Date()
			);

			expect(dayExercise.id).toBe('ex-1');
			expect(dayExercise.dayId).toBe('day-1');
			expect(dayExercise.exerciseId).toBe('exercise-1');
			expect(dayExercise.sets).toBe(3);
			expect(dayExercise.reps).toBe('8-12');
			expect(dayExercise.restTime).toBe(60);
			expect(dayExercise.order).toBe(0);
			expect(dayExercise.notes).toBe('Focus on form');
			expect(dayExercise.weight).toBe(100);
		});

		it('should create day exercise without weight', () => {
			const dayExercise = new DayExercise(
				'ex-1',
				'day-1',
				'exercise-1',
				3,
				'60s',
				30,
				0,
				null,
				null,
				new Date()
			);

			expect(dayExercise.weight).toBeNull();
		});

		it('should create day exercise with decimal weight', () => {
			const dayExercise = new DayExercise(
				'ex-1',
				'day-1',
				'exercise-1',
				3,
				'10',
				60,
				0,
				null,
				52.5,
				new Date()
			);

			expect(dayExercise.weight).toBe(52.5);
		});
	});
});
