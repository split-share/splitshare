import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutSession } from '../../../src/core/domain/workout/workout-session.entity';

describe('WorkoutSession', () => {
	let session: WorkoutSession;
	const now = new Date('2024-01-15T10:00:00Z');

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		session = new WorkoutSession(
			'session-1',
			'user-1',
			'split-1',
			'day-1',
			0, // currentExerciseIndex
			0, // currentSetIndex
			'exercise', // phase
			0, // exerciseElapsedSeconds
			null, // restRemainingSeconds
			now, // startedAt
			null, // pausedAt
			now, // lastUpdatedAt
			[], // completedSets
			now // createdAt
		);
	});

	describe('isPaused', () => {
		it('should return false when not paused', () => {
			expect(session.isPaused()).toBe(false);
		});

		it('should return true when paused', () => {
			session.pause();
			expect(session.isPaused()).toBe(true);
		});
	});

	describe('pause and resume', () => {
		it('should set pausedAt when pausing', () => {
			session.pause();
			expect(session.pausedAt).toEqual(now);
		});

		it('should clear pausedAt when resuming', () => {
			session.pause();
			session.resume();
			expect(session.pausedAt).toBeNull();
		});

		it('should update lastUpdatedAt when resuming', () => {
			session.pause();
			vi.advanceTimersByTime(5000);
			session.resume();
			expect(session.lastUpdatedAt.getTime()).toBeGreaterThan(now.getTime());
		});
	});

	describe('completeSet', () => {
		it('should add a completed set with weight', () => {
			session.completeSet(100, 10, 'felt good');

			expect(session.completedSets).toHaveLength(1);
			expect(session.completedSets[0]).toMatchObject({
				exerciseIndex: 0,
				setIndex: 0,
				weight: 100,
				reps: 10,
				notes: 'felt good'
			});
		});

		it('should add a completed set without weight', () => {
			session.completeSet(null, 15, null);

			expect(session.completedSets).toHaveLength(1);
			expect(session.completedSets[0]).toMatchObject({
				exerciseIndex: 0,
				setIndex: 0,
				weight: null,
				reps: 15,
				notes: null
			});
		});

		it('should record the correct exercise and set index', () => {
			session.currentExerciseIndex = 2;
			session.currentSetIndex = 1;
			session.completeSet(50, 8, null);

			expect(session.completedSets[0].exerciseIndex).toBe(2);
			expect(session.completedSets[0].setIndex).toBe(1);
		});
	});

	describe('startRestPhase', () => {
		it('should set phase to rest', () => {
			session.startRestPhase(60);
			expect(session.phase).toBe('rest');
		});

		it('should set rest remaining seconds', () => {
			session.startRestPhase(90);
			expect(session.restRemainingSeconds).toBe(90);
		});

		it('should reset exercise elapsed seconds', () => {
			session.exerciseElapsedSeconds = 120;
			session.startRestPhase(60);
			expect(session.exerciseElapsedSeconds).toBe(0);
		});
	});

	describe('startNextSet', () => {
		it('should increment set index', () => {
			session.startNextSet();
			expect(session.currentSetIndex).toBe(1);
		});

		it('should set phase to exercise', () => {
			session.phase = 'rest';
			session.startNextSet();
			expect(session.phase).toBe('exercise');
		});

		it('should reset timers', () => {
			session.exerciseElapsedSeconds = 100;
			session.restRemainingSeconds = 30;
			session.startNextSet();
			expect(session.exerciseElapsedSeconds).toBe(0);
			expect(session.restRemainingSeconds).toBeNull();
		});
	});

	describe('startNextExercise', () => {
		it('should increment exercise index', () => {
			session.startNextExercise();
			expect(session.currentExerciseIndex).toBe(1);
		});

		it('should reset set index to 0', () => {
			session.currentSetIndex = 2;
			session.startNextExercise();
			expect(session.currentSetIndex).toBe(0);
		});

		it('should set phase to exercise', () => {
			session.phase = 'rest';
			session.startNextExercise();
			expect(session.phase).toBe('exercise');
		});

		it('should reset timers', () => {
			session.exerciseElapsedSeconds = 100;
			session.restRemainingSeconds = 30;
			session.startNextExercise();
			expect(session.exerciseElapsedSeconds).toBe(0);
			expect(session.restRemainingSeconds).toBeNull();
		});
	});

	describe('complete', () => {
		it('should set phase to completed', () => {
			session.complete();
			expect(session.phase).toBe('completed');
		});
	});

	describe('getTotalElapsedSeconds', () => {
		it('should calculate elapsed time when not paused', () => {
			vi.advanceTimersByTime(300000); // 5 minutes
			expect(session.getTotalElapsedSeconds()).toBe(300);
		});

		it('should calculate elapsed time up to pause point when paused', () => {
			vi.advanceTimersByTime(120000); // 2 minutes
			session.pause();
			vi.advanceTimersByTime(60000); // 1 more minute passes
			expect(session.getTotalElapsedSeconds()).toBe(120);
		});
	});
});
