import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateExerciseUseCase } from '../../../../src/core/usecases/exercise/create-exercise.usecase';
import { DeleteExerciseUseCase } from '../../../../src/core/usecases/exercise/delete-exercise.usecase';
import { UpdateExerciseUseCase } from '../../../../src/core/usecases/exercise/update-exercise.usecase';
import { SearchExercisesUseCase } from '../../../../src/core/usecases/exercise/search-exercises.usecase';
import { GetUserExercisesUseCase } from '../../../../src/core/usecases/exercise/get-user-exercises.usecase';
import { Exercise } from '../../../../src/core/domain/exercise/exercise.entity';
import type { IExerciseRepository } from '../../../../src/core/ports/repositories/exercise.repository.port';

function createMockExerciseRepository(): IExerciseRepository {
	return {
		findById: vi.fn(),
		findByIds: vi.fn(),
		findByUserId: vi.fn(),
		findWithFilters: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		exists: vi.fn(),
		isOwnedByUser: vi.fn()
	};
}

const now = new Date();
const mockExercise = new Exercise(
	'ex-1',
	'user-1',
	'Bench Press',
	'A classic chest exercise',
	'intermediate',
	'Chest',
	'Barbell',
	null,
	null,
	now,
	now
);

describe('CreateExerciseUseCase', () => {
	it('should delegate to exerciseRepository.create', async () => {
		const repo = createMockExerciseRepository();
		vi.mocked(repo.create).mockResolvedValue(mockExercise);

		const useCase = new CreateExerciseUseCase(repo);
		const input = {
			userId: 'user-1',
			name: 'Bench Press',
			muscleGroup: 'Chest',
			equipmentType: 'Barbell',
			difficulty: 'intermediate' as const
		};
		const result = await useCase.execute(input);

		expect(result).toEqual(mockExercise);
		expect(repo.create).toHaveBeenCalledWith(input);
	});
});

describe('DeleteExerciseUseCase', () => {
	let repo: IExerciseRepository;
	let useCase: DeleteExerciseUseCase;

	beforeEach(() => {
		repo = createMockExerciseRepository();
		useCase = new DeleteExerciseUseCase(repo);
	});

	it('should delete an exercise owned by the user', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);

		await useCase.execute('ex-1', 'user-1');

		expect(repo.delete).toHaveBeenCalledWith('ex-1');
	});

	it('should throw NotFoundError if exercise does not exist', async () => {
		vi.mocked(repo.exists).mockResolvedValue(false);

		await expect(useCase.execute('ex-1', 'user-1')).rejects.toThrow(
			"Exercise with id 'ex-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the exercise', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('ex-1', 'user-2')).rejects.toThrow(
			'Not authorized to delete this exercise'
		);
	});
});

describe('UpdateExerciseUseCase', () => {
	let repo: IExerciseRepository;
	let useCase: UpdateExerciseUseCase;

	beforeEach(() => {
		repo = createMockExerciseRepository();
		useCase = new UpdateExerciseUseCase(repo);
	});

	it('should update an exercise owned by the user', async () => {
		const updated = new Exercise(
			'ex-1',
			'user-1',
			'Incline Press',
			null,
			'advanced',
			'Chest',
			'Barbell',
			null,
			null,
			now,
			now
		);
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(true);
		vi.mocked(repo.update).mockResolvedValue(updated);

		const result = await useCase.execute('ex-1', 'user-1', { name: 'Incline Press' });

		expect(repo.update).toHaveBeenCalledWith('ex-1', { name: 'Incline Press' });
		expect(result.name).toBe('Incline Press');
	});

	it('should throw NotFoundError if exercise does not exist', async () => {
		vi.mocked(repo.exists).mockResolvedValue(false);

		await expect(useCase.execute('ex-1', 'user-1', { name: 'X' })).rejects.toThrow(
			"Exercise with id 'ex-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the exercise', async () => {
		vi.mocked(repo.exists).mockResolvedValue(true);
		vi.mocked(repo.isOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('ex-1', 'user-2', { name: 'X' })).rejects.toThrow(
			'Not authorized to update this exercise'
		);
	});
});

describe('SearchExercisesUseCase', () => {
	it('should delegate to findWithFilters', async () => {
		const repo = createMockExerciseRepository();
		vi.mocked(repo.findWithFilters).mockResolvedValue([mockExercise]);

		const useCase = new SearchExercisesUseCase(repo);
		const filters = { muscleGroup: 'Chest' };
		const result = await useCase.execute(filters);

		expect(result).toEqual([mockExercise]);
		expect(repo.findWithFilters).toHaveBeenCalledWith(filters);
	});
});

describe('GetUserExercisesUseCase', () => {
	it('should delegate to findByUserId', async () => {
		const repo = createMockExerciseRepository();
		vi.mocked(repo.findByUserId).mockResolvedValue([mockExercise]);

		const useCase = new GetUserExercisesUseCase(repo);
		const result = await useCase.execute('user-1');

		expect(result).toEqual([mockExercise]);
		expect(repo.findByUserId).toHaveBeenCalledWith('user-1');
	});
});
