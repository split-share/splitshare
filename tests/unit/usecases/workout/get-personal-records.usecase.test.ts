import { describe, it, expect, vi } from 'vitest';
import { GetPersonalRecordsUseCase } from '$core/usecases/workout/get-personal-records.usecase';

const createMockRepo = () => ({
	findByUserId: vi.fn()
});

describe('GetPersonalRecordsUseCase', () => {
	it('returns personal records', async () => {
		const repo = createMockRepo();
		const records = [{ exerciseId: 'e1', weight: 100 }];
		repo.findByUserId.mockResolvedValue(records as never);
		const useCase = new GetPersonalRecordsUseCase(repo as never);
		const result = await useCase.execute('u1');
		expect(result).toBe(records);
	});
});
