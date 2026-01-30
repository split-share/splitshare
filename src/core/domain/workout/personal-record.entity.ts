/**
 * PersonalRecord domain entity - tracks a user's best performance for an exercise
 * Stores the maximum weight lifted with corresponding reps
 * Used for tracking progress and calculating estimated one-rep max
 */
export class PersonalRecord {
	/**
	 * Creates a new PersonalRecord instance
	 * @param {string} id - Unique identifier for the personal record
	 * @param {string} userId - ID of the user who achieved this PR
	 * @param {string} exerciseId - ID of the exercise this PR is for
	 * @param {number} weight - Weight lifted (in user's preferred unit: kg or lbs)
	 * @param {number} reps - Number of repetitions performed at this weight
	 * @param {Date} achievedAt - Date when this PR was achieved
	 * @param {Date} createdAt - Timestamp when the PR was recorded in the database
	 * @param {Date} updatedAt - Timestamp of last PR update
	 */
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly exerciseId: string,
		public weight: number,
		public reps: number,
		public readonly achievedAt: Date,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	/**
	 * Updates the personal record with a new achievement
	 * Validates weight and reps before updating
	 * Note: The achievedAt parameter is accepted but not stored (field is read-only after creation)
	 * @param {number} weight - New weight lifted
	 * @param {number} reps - New number of repetitions
	 * @param {Date} _achievedAt - Timestamp of achievement (parameter preserved for API consistency)
	 * @throws {Error} If weight is negative or reps is less than 1
	 */
	updateRecord(weight: number, reps: number, _achievedAt: Date): void {
		if (weight < 0) {
			throw new Error('Weight cannot be negative');
		}
		if (reps < 1) {
			throw new Error('Reps must be at least 1');
		}

		this.weight = weight;
		this.reps = reps;
		this.updatedAt = new Date();
	}

	/**
	 * Calculates estimated one-rep maximum using the Epley formula
	 * Formula: weight * (1 + reps / 30)
	 * @returns {number} Estimated 1RM value
	 */
	calculateOneRepMax(): number {
		return this.weight * (1 + this.reps / 30);
	}
}
