import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GetMuscleHeatmapUseCase } from '../../../src/core/usecases/workout/get-muscle-heatmap.usecase';
import type { IWorkoutLogRepository } from '../../../src/core/ports/repositories/workout-log.repository.port';
import type { WorkoutLogWithDetailsDto } from '../../../src/core/domain/workout/workout.dto';
import { MUSCLE_GROUPS } from '../../../src/lib/constants';

describe('GetMuscleHeatmapUseCase', () => {
	let workoutLogRepository: IWorkoutLogRepository;
	let useCase: GetMuscleHeatmapUseCase;

	// Helper to format date as local date string (YYYY-MM-DD) - matches use case
	const formatDateStr = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const createMockWorkoutLog = (
		completedAt: Date,
		exercises: Array<{ muscleGroup: string; sets: number }>
	): WorkoutLogWithDetailsDto => ({
		id: 'workout-1',
		userId: 'user-1',
		splitId: 'split-1',
		dayId: 'day-1',
		duration: 60,
		notes: null,
		completedAt,
		split: { id: 'split-1', title: 'Test Split' },
		day: { id: 'day-1', name: 'Day 1', dayNumber: 1 },
		exercises: exercises.map((e, i) => ({
			id: `ex-log-${i}`,
			workoutLogId: 'workout-1',
			exerciseId: `ex-${i}`,
			sets: e.sets,
			reps: '10',
			weight: 100,
			notes: null,
			exercise: {
				id: `ex-${i}`,
				name: `Exercise ${i}`,
				muscleGroup: e.muscleGroup
			},
			createdAt: completedAt
		})),
		createdAt: completedAt
	});

	beforeEach(() => {
		workoutLogRepository = {
			findById: vi.fn(),
			findByIdWithDetails: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndDateRange: vi.fn(),
			createWithExercises: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			exists: vi.fn(),
			isOwnedByUser: vi.fn(),
			getUserStats: vi.fn(),
			findExerciseHistory: vi.fn(),
			hasCompletedWorkoutForSplit: vi.fn()
		};

		useCase = new GetMuscleHeatmapUseCase(workoutLogRepository);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Basic Structure', () => {
		it('should return all muscle groups', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1', 7);

			expect(result.muscleGroups).toEqual([...MUSCLE_GROUPS]);
			expect(result.muscleGroups.length).toBe(14);
		});

		it('should return 7 dates for a week', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1', 7);

			expect(result.dates.length).toBe(7);
		});

		it('should return cells for all combinations', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1', 7);

			// 14 muscle groups * 7 days = 98 cells
			expect(result.cells.length).toBe(98);
		});

		it('should return maxSets of 0 when no workouts', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1', 7);

			expect(result.maxSets).toBe(0);
		});
	});

	describe('Aggregation', () => {
		it('should aggregate sets by muscle group for a single workout', async () => {
			const today = new Date();
			const todayStr = formatDateStr(today);

			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([
				createMockWorkoutLog(today, [
					{ muscleGroup: 'Chest', sets: 3 },
					{ muscleGroup: 'Chest', sets: 4 }
				])
			]);

			const result = await useCase.execute('user-1', 7);

			const chestCell = result.cells.find((c) => c.muscleGroup === 'Chest' && c.date === todayStr);
			expect(chestCell?.totalSets).toBe(7); // 3 + 4
		});

		it('should calculate maxSets correctly', async () => {
			const today = new Date();

			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([
				createMockWorkoutLog(today, [
					{ muscleGroup: 'Chest', sets: 5 },
					{ muscleGroup: 'Back', sets: 8 },
					{ muscleGroup: 'Legs', sets: 3 }
				])
			]);

			const result = await useCase.execute('user-1', 7);

			expect(result.maxSets).toBe(8);
		});

		it('should aggregate sets across multiple days', async () => {
			const today = new Date();
			const twoDaysAgo = new Date(today);
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

			const todayStr = formatDateStr(today);
			const twoDaysAgoStr = formatDateStr(twoDaysAgo);

			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([
				createMockWorkoutLog(twoDaysAgo, [{ muscleGroup: 'Chest', sets: 3 }]),
				createMockWorkoutLog(today, [{ muscleGroup: 'Chest', sets: 5 }])
			]);

			const result = await useCase.execute('user-1', 7);

			const chestCellTwoDaysAgo = result.cells.find(
				(c) => c.muscleGroup === 'Chest' && c.date === twoDaysAgoStr
			);
			const chestCellToday = result.cells.find(
				(c) => c.muscleGroup === 'Chest' && c.date === todayStr
			);

			expect(chestCellTwoDaysAgo?.totalSets).toBe(3);
			expect(chestCellToday?.totalSets).toBe(5);
		});

		it('should handle multiple muscle groups in one workout', async () => {
			const today = new Date();
			const todayStr = formatDateStr(today);

			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([
				createMockWorkoutLog(today, [
					{ muscleGroup: 'Chest', sets: 4 },
					{ muscleGroup: 'Triceps', sets: 3 },
					{ muscleGroup: 'Shoulders', sets: 2 }
				])
			]);

			const result = await useCase.execute('user-1', 7);

			const chestCell = result.cells.find((c) => c.muscleGroup === 'Chest' && c.date === todayStr);
			const tricepsCell = result.cells.find(
				(c) => c.muscleGroup === 'Triceps' && c.date === todayStr
			);
			const shouldersCell = result.cells.find(
				(c) => c.muscleGroup === 'Shoulders' && c.date === todayStr
			);

			expect(chestCell?.totalSets).toBe(4);
			expect(tricepsCell?.totalSets).toBe(3);
			expect(shouldersCell?.totalSets).toBe(2);
		});
	});

	describe('Date Range', () => {
		it('should call repository with correct date range for 7 days', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			await useCase.execute('user-1', 7);

			expect(workoutLogRepository.findByUserIdAndDateRange).toHaveBeenCalledWith(
				'user-1',
				expect.any(Date),
				expect.any(Date)
			);

			const [, startDate, endDate] = vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mock
				.calls[0];

			// Verify date range spans 7 days
			const diffMs = endDate.getTime() - startDate.getTime();
			const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
			expect(diffDays).toBeGreaterThanOrEqual(6);
			expect(diffDays).toBeLessThanOrEqual(7);

			// Start date should be at start of day
			expect(startDate.getHours()).toBe(0);
			expect(startDate.getMinutes()).toBe(0);

			// End date should be at end of day
			expect(endDate.getHours()).toBe(23);
			expect(endDate.getMinutes()).toBe(59);
		});

		it('should support custom day count', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1', 14);

			expect(result.dates.length).toBe(14);
		});

		it('should default to 7 days', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1');

			expect(result.dates.length).toBe(7);
		});
	});

	describe('Empty Data', () => {
		it('should return zero sets for all cells when no workouts', async () => {
			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([]);

			const result = await useCase.execute('user-1', 7);

			const allZero = result.cells.every((cell) => cell.totalSets === 0);
			expect(allZero).toBe(true);
		});

		it('should return zero for untrained muscle groups', async () => {
			const today = new Date();
			const todayStr = formatDateStr(today);

			vi.mocked(workoutLogRepository.findByUserIdAndDateRange).mockResolvedValue([
				createMockWorkoutLog(today, [{ muscleGroup: 'Chest', sets: 5 }])
			]);

			const result = await useCase.execute('user-1', 7);

			const backCell = result.cells.find((c) => c.muscleGroup === 'Back' && c.date === todayStr);
			expect(backCell?.totalSets).toBe(0);
		});
	});
});
