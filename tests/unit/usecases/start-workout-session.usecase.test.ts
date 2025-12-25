import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StartWorkoutSessionUseCase } from '../../../src/core/usecases/workout/start-workout-session.usecase';
import { WorkoutSession } from '../../../src/core/domain/workout/workout-session.entity';
import type { IWorkoutSessionRepository } from '../../../src/core/ports/repositories/workout-session.repository.port';
import type { ISplitRepository } from '../../../src/core/ports/repositories/split.repository.port';
import type { CreateWorkoutSessionDto } from '../../../src/core/domain/workout/workout-session.dto';
import type { SplitWithDetailsDto } from '../../../src/core/domain/split/split.dto';
import type { Difficulty } from '../../../src/core/domain/common/value-objects';

describe('StartWorkoutSessionUseCase', () => {
	let workoutSessionRepository: IWorkoutSessionRepository;
	let splitRepository: ISplitRepository;
	let useCase: StartWorkoutSessionUseCase;
	const now = new Date();

	const createMockSplitWithDetails = (
		overrides: {
			userId?: string;
			isPublic?: boolean;
			isRestDay?: boolean;
			exercises?: SplitWithDetailsDto['days'][0]['exercises'];
		} = {}
	): SplitWithDetailsDto => ({
		split: {
			id: 'split-1',
			userId: overrides.userId ?? 'user-1',
			title: 'Test Split',
			description: null,
			isPublic: overrides.isPublic ?? false,
			isDefault: false,
			difficulty: 'intermediate' as Difficulty,
			duration: null,
			imageUrl: null,
			videoUrl: null,
			tags: null,
			createdAt: now,
			updatedAt: now
		},
		author: { id: 'user-1', name: 'Test User', image: null },
		days: [
			{
				id: 'day-1',
				splitId: 'split-1',
				dayNumber: 1,
				name: 'Chest Day',
				isRestDay: overrides.isRestDay ?? false,
				createdAt: now,
				updatedAt: now,
				exercises:
					overrides.exercises ??
					(overrides.isRestDay
						? []
						: [
								{
									id: 'ex-1',
									dayId: 'day-1',
									exerciseId: null,
									sets: 3,
									reps: '8-12',
									restTime: 90,
									order: 0,
									notes: null,
									weight: null,
									createdAt: now,
									exercise: {
										id: 'exercise-1',
										name: 'Bench Press',
										description: null,
										difficulty: 'intermediate' as Difficulty,
										muscleGroup: 'chest',
										equipmentType: 'barbell',
										imageUrl: null,
										videoUrl: null
									}
								}
							])
			}
		],
		likesCount: 0,
		commentsCount: 0,
		isLiked: false
	});

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

		splitRepository = {
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findWithFilters: vi.fn(),
			createWithDays: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn()
		};

		useCase = new StartWorkoutSessionUseCase(workoutSessionRepository, splitRepository);
	});

	it('should create a new workout session', async () => {
		const mockSession = new WorkoutSession(
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

		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(createMockSplitWithDetails());
		vi.mocked(workoutSessionRepository.create).mockResolvedValue(mockSession);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1'
		};

		const result = await useCase.execute(input);

		expect(result).toEqual(mockSession);
		expect(workoutSessionRepository.create).toHaveBeenCalledWith(input);
	});

	it('should throw error if user has an active session', async () => {
		const existingSession = new WorkoutSession(
			'session-existing',
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

		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(existingSession);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1'
		};

		await expect(useCase.execute(input)).rejects.toThrow(
			'You already have an active workout session'
		);
	});

	it('should throw error if split not found', async () => {
		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(undefined);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'nonexistent-split',
			dayId: 'day-1'
		};

		await expect(useCase.execute(input)).rejects.toThrow('Split not found');
	});

	it('should throw error if user does not have access to private split', async () => {
		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(
			createMockSplitWithDetails({ userId: 'other-user', isPublic: false })
		);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1'
		};

		await expect(useCase.execute(input)).rejects.toThrow('You do not have access to this split');
	});

	it('should allow access to public split owned by another user', async () => {
		const mockSession = new WorkoutSession(
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

		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(
			createMockSplitWithDetails({ userId: 'other-user', isPublic: true })
		);
		vi.mocked(workoutSessionRepository.create).mockResolvedValue(mockSession);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1'
		};

		const result = await useCase.execute(input);
		expect(result).toEqual(mockSession);
	});

	it('should throw error if day not found in split', async () => {
		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(createMockSplitWithDetails());

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'nonexistent-day'
		};

		await expect(useCase.execute(input)).rejects.toThrow('Day not found in this split');
	});

	it('should throw error if day is a rest day', async () => {
		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(
			createMockSplitWithDetails({ isRestDay: true })
		);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1'
		};

		await expect(useCase.execute(input)).rejects.toThrow('Cannot start a workout on a rest day');
	});

	it('should throw error if day has no exercises', async () => {
		vi.mocked(workoutSessionRepository.findActiveByUserId).mockResolvedValue(undefined);
		vi.mocked(splitRepository.findByIdWithDetails).mockResolvedValue(
			createMockSplitWithDetails({ exercises: [] })
		);

		const input: CreateWorkoutSessionDto = {
			userId: 'user-1',
			splitId: 'split-1',
			dayId: 'day-1'
		};

		await expect(useCase.execute(input)).rejects.toThrow('This day has no exercises');
	});
});
