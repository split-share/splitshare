import type { SplitRepository } from './split.repository';
import type {
	Split,
	CreateSplitInput,
	UpdateSplitInput,
	SplitFilters,
	PaginationOptions,
	SplitWithDetails
} from './types';

/**
 * Service layer for split-related business logic
 */
export class SplitService {
	/**
	 * Creates split service instance
	 * @param {SplitRepository} repository - Split repository instance
	 */
	constructor(private repository: SplitRepository) {}

	/**
	 * Retrieves split by ID with full details including days, exercises, and engagement metrics
	 * @param {string} id - Split ID
	 * @param {string} currentUserId - Optional current user ID for like status
	 * @returns {Promise<SplitWithDetails | undefined>} Split with full details or undefined if not found
	 */
	async getSplitById(id: string, currentUserId?: string): Promise<SplitWithDetails | undefined> {
		return this.repository.findByIdWithDetails(id, currentUserId);
	}

	/**
	 * Retrieves all splits created by a specific user
	 * @param {string} userId - User ID
	 * @returns {Promise<Split[]>} Array of splits owned by the user
	 */
	async getUserSplits(userId: string): Promise<Split[]> {
		return this.repository.findByUserId(userId);
	}

	/**
	 * Searches splits with filters and pagination
	 * @param {SplitFilters} filters - Filter criteria
	 * @param {PaginationOptions} pagination - Pagination options
	 * @param {string} currentUserId - Optional current user ID for like status
	 * @returns {Promise<SplitWithDetails[]>} Array of filtered splits with details
	 */
	async searchSplits(
		filters: SplitFilters,
		pagination: PaginationOptions,
		currentUserId?: string
	): Promise<SplitWithDetails[]> {
		return this.repository.findWithFilters(filters, pagination, currentUserId);
	}

	/**
	 * Creates a new split with validation
	 * @param {CreateSplitInput} input - Split data including days and exercises
	 * @returns {Promise<Split>} Created split
	 * @throws {Error} If validation fails
	 */
	async createSplit(input: CreateSplitInput): Promise<Split> {
		// Validate input
		if (!input.title.trim()) {
			throw new Error('Split title is required');
		}

		if (!['beginner', 'intermediate', 'advanced'].includes(input.difficulty)) {
			throw new Error('Invalid difficulty level');
		}

		if (!input.days || input.days.length === 0) {
			throw new Error('At least one day is required');
		}

		// Validate days
		const dayNumbers = new Set<number>();
		for (const day of input.days) {
			if (day.dayNumber < 1) {
				throw new Error('Day number must be positive');
			}

			if (dayNumbers.has(day.dayNumber)) {
				throw new Error(`Duplicate day number: ${day.dayNumber}`);
			}
			dayNumbers.add(day.dayNumber);

			if (!day.name.trim()) {
				throw new Error('Day name is required');
			}

			// Validate exercises for non-rest days
			if (!day.isRestDay) {
				if (!day.exercises || day.exercises.length === 0) {
					throw new Error(
						`Day ${day.dayNumber} must have at least one exercise or be marked as rest day`
					);
				}

				const exerciseOrders = new Set<number>();
				for (const exercise of day.exercises) {
					if (exercise.sets < 1) {
						throw new Error('Exercise must have at least 1 set');
					}

					if (!exercise.reps.trim()) {
						throw new Error('Exercise reps are required');
					}

					if (exerciseOrders.has(exercise.order)) {
						throw new Error(`Duplicate exercise order in day ${day.dayNumber}`);
					}
					exerciseOrders.add(exercise.order);
				}
			}
		}

		return this.repository.createWithDays(input);
	}

	/**
	 * Updates an existing split
	 * @param {string} id - Split ID
	 * @param {string} userId - User ID making the update
	 * @param {UpdateSplitInput} input - Fields to update
	 * @returns {Promise<Split>} Updated split
	 * @throws {Error} If split not found, user not authorized, or validation fails
	 */
	async updateSplit(id: string, userId: string, input: UpdateSplitInput): Promise<Split> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('Split not found');
		}

		const isOwner = await this.repository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new Error('Not authorized to update this split');
		}

		// Validate input if provided
		if (input.title !== undefined && !input.title.trim()) {
			throw new Error('Split title cannot be empty');
		}

		if (input.difficulty && !['beginner', 'intermediate', 'advanced'].includes(input.difficulty)) {
			throw new Error('Invalid difficulty level');
		}

		return this.repository.update(id, input);
	}

	/**
	 * Deletes a split
	 * @param {string} id - Split ID
	 * @param {string} userId - User ID requesting deletion
	 * @returns {Promise<void>}
	 * @throws {Error} If split not found or user not authorized
	 */
	async deleteSplit(id: string, userId: string): Promise<void> {
		const exists = await this.repository.exists(id);
		if (!exists) {
			throw new Error('Split not found');
		}

		const isOwner = await this.repository.isOwnedByUser(id, userId);
		if (!isOwner) {
			throw new Error('Not authorized to delete this split');
		}

		await this.repository.delete(id);
	}

	/**
	 * Checks if a split exists
	 * @param {string} id - Split ID
	 * @returns {Promise<boolean>} True if split exists
	 */
	async splitExists(id: string): Promise<boolean> {
		return this.repository.exists(id);
	}

	/**
	 * Checks if user can modify a split
	 * @param {string} id - Split ID
	 * @param {string} userId - User ID
	 * @returns {Promise<boolean>} True if user owns the split
	 */
	async canUserModify(id: string, userId: string): Promise<boolean> {
		return this.repository.isOwnedByUser(id, userId);
	}
}
