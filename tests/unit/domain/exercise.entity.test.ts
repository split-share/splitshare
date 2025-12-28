import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Exercise } from '../../../src/core/domain/exercise/exercise.entity';

describe('Exercise Entity', () => {
	let exercise: Exercise;
	const now = new Date('2024-01-15T10:00:00Z');

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		exercise = new Exercise(
			'exercise-1',
			'user-1',
			'Bench Press',
			'Chest pressing exercise',
			'intermediate',
			'Chest',
			'Barbell',
			'https://example.com/bench.jpg',
			'https://example.com/bench.gif',
			now,
			now
		);
	});

	describe('constructor', () => {
		it('should create an exercise with all properties', () => {
			expect(exercise.id).toBe('exercise-1');
			expect(exercise.userId).toBe('user-1');
			expect(exercise.name).toBe('Bench Press');
			expect(exercise.description).toBe('Chest pressing exercise');
			expect(exercise.difficulty).toBe('intermediate');
			expect(exercise.muscleGroup).toBe('Chest');
			expect(exercise.equipmentType).toBe('Barbell');
			expect(exercise.imageUrl).toBe('https://example.com/bench.jpg');
			expect(exercise.gifUrl).toBe('https://example.com/bench.gif');
			expect(exercise.createdAt).toEqual(now);
			expect(exercise.updatedAt).toEqual(now);
		});

		it('should create an exercise with minimal properties', () => {
			const minimalExercise = new Exercise(
				'exercise-2',
				'user-2',
				'Push-ups',
				null,
				'beginner',
				'Chest',
				'Bodyweight',
				null,
				null,
				now,
				now
			);

			expect(minimalExercise.description).toBeNull();
			expect(minimalExercise.imageUrl).toBeNull();
			expect(minimalExercise.gifUrl).toBeNull();
		});
	});

	describe('update', () => {
		it('should update name', () => {
			const newTime = new Date('2024-01-15T11:00:00Z');
			vi.setSystemTime(newTime);

			exercise.update({ name: 'Incline Bench Press' });

			expect(exercise.name).toBe('Incline Bench Press');
			expect(exercise.updatedAt).toEqual(newTime);
		});

		it('should update description', () => {
			exercise.update({ description: 'New description' });
			expect(exercise.description).toBe('New description');
		});

		it('should update description to null', () => {
			exercise.update({ description: null });
			expect(exercise.description).toBeNull();
		});

		it('should update difficulty', () => {
			exercise.update({ difficulty: 'advanced' });
			expect(exercise.difficulty).toBe('advanced');
		});

		it('should update muscleGroup', () => {
			exercise.update({ muscleGroup: 'Upper Chest' });
			expect(exercise.muscleGroup).toBe('Upper Chest');
		});

		it('should update equipmentType', () => {
			exercise.update({ equipmentType: 'Dumbbell' });
			expect(exercise.equipmentType).toBe('Dumbbell');
		});

		it('should update imageUrl', () => {
			exercise.update({ imageUrl: 'https://example.com/new-image.jpg' });
			expect(exercise.imageUrl).toBe('https://example.com/new-image.jpg');
		});

		it('should update imageUrl to null', () => {
			exercise.update({ imageUrl: null });
			expect(exercise.imageUrl).toBeNull();
		});

		it('should update gifUrl', () => {
			exercise.update({ gifUrl: 'https://example.com/new-gif.gif' });
			expect(exercise.gifUrl).toBe('https://example.com/new-gif.gif');
		});

		it('should update gifUrl to null', () => {
			exercise.update({ gifUrl: null });
			expect(exercise.gifUrl).toBeNull();
		});

		it('should update multiple properties at once', () => {
			const newTime = new Date('2024-01-15T12:00:00Z');
			vi.setSystemTime(newTime);

			exercise.update({
				name: 'Dumbbell Bench Press',
				difficulty: 'beginner',
				equipmentType: 'Dumbbell',
				description: 'Dumbbell chest exercise'
			});

			expect(exercise.name).toBe('Dumbbell Bench Press');
			expect(exercise.difficulty).toBe('beginner');
			expect(exercise.equipmentType).toBe('Dumbbell');
			expect(exercise.description).toBe('Dumbbell chest exercise');
			expect(exercise.updatedAt).toEqual(newTime);
		});

		it('should not update properties that are not provided', () => {
			const originalName = exercise.name;
			const originalMuscleGroup = exercise.muscleGroup;

			exercise.update({ difficulty: 'advanced' });

			expect(exercise.name).toBe(originalName);
			expect(exercise.muscleGroup).toBe(originalMuscleGroup);
		});

		it('should always update updatedAt timestamp', () => {
			const newTime = new Date('2024-01-15T13:00:00Z');
			vi.setSystemTime(newTime);

			exercise.update({});

			expect(exercise.updatedAt).toEqual(newTime);
		});
	});

});
