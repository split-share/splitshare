import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	CompleteSetUseCase,
	type CompleteSetInput
} from '../../../src/core/usecases/workout/complete-set.usecase';
import { WorkoutSession } from '../../../src/core/domain/workout/workout-session.entity';
import type { IWorkoutSessionRepository } from '../../../src/core/ports/repositories/workout-session.repository.port';
import type { WorkoutSessionWithDetailsDto } from '../../../src/core/domain/workout/workout-session.dto';

describe('CompleteSetUseCase', () => {
	let workoutSessionRepository: IWorkoutSessionRepository;
	let useCase: CompleteSetUseCase;
	const now = new Date();

	const createMockSessionData = (
		overrides: {
			currentExerciseIndex?: number;
			currentSetIndex?: number;
			phase?: 'exercise' | 'rest' | 'completed';
			exerciseElapsedSeconds?: number;
			restRemainingSeconds?: number | null;
			pausedAt?: Date | null;
			completedSets?: [];
		} = {},
		exerciseCount = 2,
		setsPerExercise = 3
	): WorkoutSessionWithDetailsDto => {
		const exercises = Array.from({ length: exerciseCount }, (_, i) => ({
			id: `ex-${i + 1}`,
			exerciseId: null,
			exerciseName: `Exercise ${i + 1}`,
			sets: setsPerExercise,
			reps: '8-12',
			restTime: 60,
			order: i,
			notes: null,
			weight: null,
			exercise: {
				id: `exercise-${i + 1}`,
				name: `Exercise ${i + 1}`,
				description: null,
				difficulty: 'intermediate',
				muscleGroup: 'chest',
				equipmentType: 'barbell',
				imageUrl: null,
				videoUrl: null
			}
		}));

		return {
			session: {
				id: 'session-1',
				userId: 'user-1',
				splitId: 'split-1',
				dayId: 'day-1',
				currentExerciseIndex: overrides.currentExerciseIndex ?? 0,
				currentSetIndex: overrides.currentSetIndex ?? 0,
				phase: overrides.phase ?? 'exercise',
				exerciseElapsedSeconds: overrides.exerciseElapsedSeconds ?? 0,
				restRemainingSeconds: overrides.restRemainingSeconds ?? null,
				startedAt: now,
				pausedAt: overrides.pausedAt ?? null,
				lastUpdatedAt: now,
				completedSets: overrides.completedSets ?? [],
				createdAt: now
			},
			split: {
				id: 'split-1',
				title: 'Test Split'
			},
			day: {
				id: 'day-1',
				name: 'Chest Day',
				dayNumber: 1
			},
			exercises
		};
	};

	const createMockWorkoutSession = (): WorkoutSession => {
		return new WorkoutSession(
			'session-1',
			'user-1',
			'split-1',
			'day-1',
			0,
			0,
			'exercise',
			0,
			null,
			now,
			null,
			now,
			[],
			now
		);
	};

	beforeEach(() => {
		workoutSessionRepository = {
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findActiveByUserId: vi.fn(),
			findActiveByUserIdWithDetails: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new CompleteSetUseCase(workoutSessionRepository);
	});

	describe('Validation', () => {
		it('should throw error if session not found', async () => {
			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails).mockResolvedValue(
				undefined
			);

			const input: CompleteSetInput = {
				sessionId: 'session-1',
				userId: 'user-1',
				weight: 100,
				reps: 10,
				notes: null
			};

			await expect(useCase.execute(input)).rejects.toThrow(
				'Session not found or not owned by user'
			);
		});

		it('should throw error if session ID does not match', async () => {
			const mockSessionData = createMockSessionData();
			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails).mockResolvedValue(
				mockSessionData
			);

			const input: CompleteSetInput = {
				sessionId: 'different-session-id',
				userId: 'user-1',
				weight: 100,
				reps: 10,
				notes: null
			};

			await expect(useCase.execute(input)).rejects.toThrow(
				'Session not found or not owned by user'
			);
		});
	});

	describe('Set completion', () => {
		it('should transition to rest phase after completing a set (not last set)', async () => {
			const mockSessionData = createMockSessionData({ currentSetIndex: 0 });
			const updatedSessionData = createMockSessionData({
				currentSetIndex: 1,
				phase: 'rest',
				restRemainingSeconds: 60
			});
			const mockSession = createMockWorkoutSession();

			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails)
				.mockResolvedValueOnce(mockSessionData)
				.mockResolvedValueOnce(updatedSessionData);
			vi.mocked(workoutSessionRepository.update).mockResolvedValue(mockSession);

			const input: CompleteSetInput = {
				sessionId: 'session-1',
				userId: 'user-1',
				weight: 100,
				reps: 10,
				notes: 'felt good'
			};

			await useCase.execute(input);

			expect(workoutSessionRepository.update).toHaveBeenCalledWith('session-1', {
				phase: 'rest',
				currentExerciseIndex: 0,
				currentSetIndex: 1,
				restRemainingSeconds: 60,
				exerciseElapsedSeconds: 0,
				completedSets: expect.arrayContaining([
					expect.objectContaining({
						exerciseIndex: 0,
						setIndex: 0,
						weight: 100,
						reps: 10,
						notes: 'felt good'
					})
				])
			});
		});

		it('should move to next exercise after completing last set of current exercise', async () => {
			const mockSessionData = createMockSessionData({
				currentExerciseIndex: 0,
				currentSetIndex: 2 // Last set (3 sets total, 0-indexed)
			});
			const updatedSessionData = createMockSessionData({
				currentExerciseIndex: 1,
				currentSetIndex: 0,
				phase: 'rest'
			});
			const mockSession = createMockWorkoutSession();

			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails)
				.mockResolvedValueOnce(mockSessionData)
				.mockResolvedValueOnce(updatedSessionData);
			vi.mocked(workoutSessionRepository.update).mockResolvedValue(mockSession);

			const input: CompleteSetInput = {
				sessionId: 'session-1',
				userId: 'user-1',
				weight: 100,
				reps: 10,
				notes: null
			};

			await useCase.execute(input);

			expect(workoutSessionRepository.update).toHaveBeenCalledWith(
				'session-1',
				expect.objectContaining({
					phase: 'rest',
					currentExerciseIndex: 1,
					currentSetIndex: 0
				})
			);
		});

		it('should mark workout as completed after last set of last exercise', async () => {
			const mockSessionData = createMockSessionData({
				currentExerciseIndex: 1, // Last exercise (2 total)
				currentSetIndex: 2 // Last set
			});
			const completedSessionData = createMockSessionData({
				currentExerciseIndex: 1,
				currentSetIndex: 2,
				phase: 'completed'
			});
			const mockSession = createMockWorkoutSession();

			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails)
				.mockResolvedValueOnce(mockSessionData)
				.mockResolvedValueOnce(completedSessionData);
			vi.mocked(workoutSessionRepository.update).mockResolvedValue(mockSession);

			const input: CompleteSetInput = {
				sessionId: 'session-1',
				userId: 'user-1',
				weight: 100,
				reps: 10,
				notes: null
			};

			await useCase.execute(input);

			expect(workoutSessionRepository.update).toHaveBeenCalledWith(
				'session-1',
				expect.objectContaining({
					phase: 'completed'
				})
			);
		});

		it('should handle null weight', async () => {
			const mockSessionData = createMockSessionData();
			const mockSession = createMockWorkoutSession();

			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails)
				.mockResolvedValueOnce(mockSessionData)
				.mockResolvedValueOnce(mockSessionData);
			vi.mocked(workoutSessionRepository.update).mockResolvedValue(mockSession);

			const input: CompleteSetInput = {
				sessionId: 'session-1',
				userId: 'user-1',
				weight: null,
				reps: 15,
				notes: null
			};

			await useCase.execute(input);

			expect(workoutSessionRepository.update).toHaveBeenCalledWith(
				'session-1',
				expect.objectContaining({
					completedSets: expect.arrayContaining([
						expect.objectContaining({
							weight: null,
							reps: 15
						})
					])
				})
			);
		});

		it('should use default rest time of 60 seconds if not specified', async () => {
			const mockSessionData = createMockSessionData();
			// Override to have no restTime
			mockSessionData.exercises[0].restTime = null;
			const mockSession = createMockWorkoutSession();

			vi.mocked(workoutSessionRepository.findActiveByUserIdWithDetails)
				.mockResolvedValueOnce(mockSessionData)
				.mockResolvedValueOnce(mockSessionData);
			vi.mocked(workoutSessionRepository.update).mockResolvedValue(mockSession);

			const input: CompleteSetInput = {
				sessionId: 'session-1',
				userId: 'user-1',
				weight: 100,
				reps: 10,
				notes: null
			};

			await useCase.execute(input);

			expect(workoutSessionRepository.update).toHaveBeenCalledWith(
				'session-1',
				expect.objectContaining({
					restRemainingSeconds: 60
				})
			);
		});
	});
});
