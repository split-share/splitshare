import { describe, it, expect, vi, type Mocked } from 'vitest';
import { GetPersonalRecordsUseCase } from '$core/usecases/workout/get-personal-records.usecase';
import type { IPersonalRecordRepository } from '$core/ports/repositories/personal-record.repository.port';
import type { PersonalRecordDto } from '$core/domain/workout/workout.dto';

describe('GetPersonalRecordsUseCase', () => {
	const createMockRepo = (): Mocked<IPersonalRecordRepository> =>
		({
			findByUserId: vi.fn(),
			findById: vi.fn(),
			findByUserIdAndExerciseId: vi.fn(),
			upsert: vi.fn(),
			delete: vi.fn(),
			isOwnedByUser: vi.fn()
		}) as unknown as Mocked<IPersonalRecordRepository>;

	it('returns personal records', async () => {
		const repo = createMockRepo();
		const records: PersonalRecordDto[] = [
			{
				id: 'pr1',
				userId: 'u1',
				exerciseId: 'e1',
				exercise: { id: 'e1', name: 'Bench Press', muscleGroup: 'Chest' },
				weight: 100,
				reps: 10,
				oneRepMax: 133.3,
				achievedAt: new Date()
			}
		];
		repo.findByUserId.mockResolvedValue(records);
		const useCase = new GetPersonalRecordsUseCase(repo);
		const result = await useCase.execute('u1');
		expect(result).toBe(records);
	});
});
