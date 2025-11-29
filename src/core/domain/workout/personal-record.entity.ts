/**
 * PersonalRecord domain entity - tracks best performance per exercise
 */
export class PersonalRecord {
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
	 * Calculates estimated 1RM using Epley formula
	 */
	calculateOneRepMax(): number {
		return this.weight * (1 + this.reps / 30);
	}
}
