import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateWeightEntryUseCase } from '../../../../src/core/usecases/weight/create-weight-entry.usecase';
import { DeleteWeightEntryUseCase } from '../../../../src/core/usecases/weight/delete-weight-entry.usecase';
import { GetWeightChartDataUseCase } from '../../../../src/core/usecases/weight/get-weight-chart-data.usecase';
import { GetWeightHistoryUseCase } from '../../../../src/core/usecases/weight/get-weight-history.usecase';
import { GetWeightStatsUseCase } from '../../../../src/core/usecases/weight/get-weight-stats.usecase';
import { WeightEntry } from '../../../../src/core/domain/weight/weight-entry.entity';
import type { IWeightEntryRepository } from '../../../../src/core/ports/repositories/weight-entry.repository.port';

function createMockWeightEntryRepository(): IWeightEntryRepository {
	return {
		findById: vi.fn(),
		findByUserId: vi.fn(),
		findByUserIdAndDateRange: vi.fn(),
		create: vi.fn(),
		upsertByDate: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		exists: vi.fn(),
		isOwnedByUser: vi.fn(),
		getUserStats: vi.fn(),
		getChartData: vi.fn(),
		existsForDate: vi.fn()
	};
}

const now = new Date();
const mockEntry = new WeightEntry('we-1', 'user-1', 75.5, now, null, now, now);

describe('CreateWeightEntryUseCase', () => {
	it('should delegate to upsertByDate', async () => {
		const repo = createMockWeightEntryRepository();
		vi.mocked(repo.upsertByDate).mockResolvedValue(mockEntry);

		const useCase = new CreateWeightEntryUseCase(repo);
		const input = { userId: 'user-1', weight: 75.5, recordedAt: now };
		const result = await useCase.execute(input);

		expect(result).toEqual(mockEntry);
		expect(repo.upsertByDate).toHaveBeenCalledWith(input);
	});
});

describe('DeleteWeightEntryUseCase', () => {
	let repo: IWeightEntryRepository;
	let useCase: DeleteWeightEntryUseCase;

	beforeEach(() => {
		repo = createMockWeightEntryRepository();
		useCase = new DeleteWeightEntryUseCase(repo);
	});

	it('should delete an entry owned by the user', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);

		await useCase.execute('we-1', 'user-1');

		expect(repo.delete).toHaveBeenCalledWith('we-1');
	});

	it('should throw if entry does not exist', async () => {
		vi.mocked(repo.exists).mockResolvedValue(false);

		await expect(useCase.execute('we-1', 'user-1')).rejects.toThrow('Weight entry not found');
	});

	it('should throw if user does not own the entry', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('we-1', 'user-2')).rejects.toThrow(
			'Unauthorized: You do not own this weight entry'
		);
	});
});

describe('GetWeightChartDataUseCase', () => {
	it('should delegate to getChartData with default limit', async () => {
		const repo = createMockWeightEntryRepository();
		const mockData = [{ date: now, weight: 75.5 }];
		vi.mocked(repo.getChartData).mockResolvedValue(mockData);

		const useCase = new GetWeightChartDataUseCase(repo);
		const result = await useCase.execute('user-1');

		expect(result).toEqual(mockData);
		expect(repo.getChartData).toHaveBeenCalledWith('user-1', 90);
	});

	it('should pass custom limit', async () => {
		const repo = createMockWeightEntryRepository();
		vi.mocked(repo.getChartData).mockResolvedValue([]);

		const useCase = new GetWeightChartDataUseCase(repo);
		await useCase.execute('user-1', 30);

		expect(repo.getChartData).toHaveBeenCalledWith('user-1', 30);
	});
});

describe('GetWeightHistoryUseCase', () => {
	it('should delegate to findByUserId with default limit', async () => {
		const repo = createMockWeightEntryRepository();
		vi.mocked(repo.findByUserId).mockResolvedValue([]);

		const useCase = new GetWeightHistoryUseCase(repo);
		await useCase.execute('user-1');

		expect(repo.findByUserId).toHaveBeenCalledWith('user-1', 100);
	});

	it('should pass custom limit', async () => {
		const repo = createMockWeightEntryRepository();
		vi.mocked(repo.findByUserId).mockResolvedValue([]);

		const useCase = new GetWeightHistoryUseCase(repo);
		await useCase.execute('user-1', 50);

		expect(repo.findByUserId).toHaveBeenCalledWith('user-1', 50);
	});
});

describe('GetWeightStatsUseCase', () => {
	it('should delegate to getUserStats', async () => {
		const repo = createMockWeightEntryRepository();
		const mockStats = {
			currentWeight: 75.5,
			totalChange: -4.5,
			averageWeight: 77,
			highestWeight: 80,
			lowestWeight: 75,
			totalEntries: 10,
			firstEntryDate: now,
			latestEntryDate: now
		};
		vi.mocked(repo.getUserStats).mockResolvedValue(mockStats);

		const useCase = new GetWeightStatsUseCase(repo);
		const result = await useCase.execute('user-1');

		expect(result).toEqual(mockStats);
		expect(repo.getUserStats).toHaveBeenCalledWith('user-1');
	});
});
