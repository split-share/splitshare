import type { Split } from '../../domain/split/split.entity';
import type {
	CreateSplitDto,
	UpdateSplitDto,
	SplitFiltersDto,
	SplitWithDetailsDto,
	SplitDto
} from '../../domain/split/split.dto';
import type { Pagination } from '../../domain/common/value-objects';

/**
 * Port (interface) for Split repository
 * Any database implementation must implement this interface
 */
export interface ISplitRepository {
	/**
	 * Finds split by ID
	 */
	findById(id: string): Promise<Split | undefined>;

	/**
	 * Finds split by ID with full details
	 */
	findByIdWithDetails(id: string, currentUserId?: string): Promise<SplitWithDetailsDto | undefined>;

	/**
	 * Finds all splits for a user (returns plain objects for serialization)
	 */
	findByUserId(userId: string): Promise<SplitDto[]>;

	/**
	 * Finds splits with filters and pagination
	 */
	findWithFilters(
		filters: SplitFiltersDto,
		pagination: Pagination,
		currentUserId?: string
	): Promise<SplitWithDetailsDto[]>;

	/**
	 * Creates a split with days and exercises
	 */
	createWithDays(data: CreateSplitDto): Promise<Split>;

	/**
	 * Updates a split
	 */
	update(id: string, data: UpdateSplitDto): Promise<Split>;

	/**
	 * Deletes a split
	 */
	delete(id: string): Promise<void>;

	/**
	 * Checks if split exists
	 */
	exists(id: string): Promise<boolean>;

	/**
	 * Checks if user owns the split
	 */
	isOwnedByUser(id: string, userId: string): Promise<boolean>;
}
