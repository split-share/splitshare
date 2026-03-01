import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { SplitFiltersDto } from '../../domain/split/split.dto';

/**
 * Use case for counting splits matching given filters
 */
export class CountSplitsUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Counts splits matching the provided filters
	 * @param {SplitFiltersDto} filters - Filter criteria
	 * @returns {Promise<number>} Number of matching splits
	 */
	async execute(filters: SplitFiltersDto): Promise<number> {
		return this.splitRepository.countWithFilters(filters);
	}
}
