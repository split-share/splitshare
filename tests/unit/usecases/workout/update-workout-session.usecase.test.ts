/* eslint-disable @typescript-eslint/no-explicit-any */

import { UpdateWorkoutSessionUseCase } from '$core/usecases/workout/update-workout-session.usecase';
import { describe, it, expect, vi } from 'vitest';

interface IWorkoutSessionRepository {
	isOwnedByUser: (sessionId: string, userId: string) => Promise<boolean>;
	update: (sessionId: string, data: any) => Promise<any>;
}

describe('UpdateWorkoutSessionUseCase', () => {
	it('updates session when owned', async () => {
		const repo: IWorkoutSessionRepository = {
			isOwnedByUser: vi.fn(),
			update: vi.fn()
		};
		const session = {
			id: 'sess1',
			userId: 'u1',
			splitId: 's1',
			dayId: 'd1',
			currentExerciseIndex: 0,
			currentSetIndex: 0,
			phase: 'exercise',
			exerciseElapsedSeconds: 0,
			restRemainingSeconds: null,
			startedAt: new Date(),
			pausedAt: null,
			lastUpdatedAt: new Date(),
			completedSets: [],
			createdAt: new Date()
		} as any;
		(repo.isOwnedByUser as any).mockResolvedValue(true);
		(repo.update as any).mockResolvedValue(session);
		const useCase = new UpdateWorkoutSessionUseCase(repo as any);
		const updateDto = { currentExerciseIndex: 1 };
		const result = await useCase.execute('sess1', 'u1', updateDto);
		expect(result).toBe(session);
		expect(repo.update).toHaveBeenCalledWith('sess1', updateDto);
	});

	it('throws when not owned', async () => {
		const repo: IWorkoutSessionRepository = {
			isOwnedByUser: vi.fn(),
			update: vi.fn()
		};
		(repo.isOwnedByUser as any).mockResolvedValue(false);
		const useCase = new UpdateWorkoutSessionUseCase(repo as any);
		const updateDto = { currentExerciseIndex: 1 };
		await expect(useCase.execute('sess1', 'u1', updateDto)).rejects.toThrow(
			'Session not found or not owned by user'
		);
	});
});
