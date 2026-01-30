import type { ISplitRepository } from '../../ports/repositories/split.repository.port';
import type { SplitFiltersDto, SplitWithDetailsDto } from '../../domain/split/split.dto';
import type { Pagination } from '../../domain/common/value-objects';

/**
 * Use case for searching splits with filters and pagination
 */
export class SearchSplitsUseCase {
	constructor(private splitRepository: ISplitRepository) {}

	/**
	 * Searches splits with optional filters and pagination
	 * @param {SplitFiltersDto} filters - Filter criteria (difficulty, muscle groups, etc.)
	 * @param {Pagination} pagination - Pagination options (page, limit)
	 * @param {string} [currentUserId] - Optional ID of current user for access checks
	 * @returns {Promise<SplitWithDetailsDto[]>} List of splits matching criteria
	 */
	async execute(
		filters: SplitFiltersDto,
		pagination: Pagination,
		currentUserId?: string
	): Promise<SplitWithDetailsDto[]> {
		return this.splitRepository.findWithFilters(filters, pagination, currentUserId);
	}
}
