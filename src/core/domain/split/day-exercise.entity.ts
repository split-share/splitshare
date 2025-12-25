/**
 * DayExercise domain entity - junction between day and exercise
 */
export class DayExercise {
	constructor(
		public readonly id: string,
		public readonly dayId: string,
		public readonly exerciseId: string,
		public sets: number,
		public reps: string,
		public restTime: number | null,
		public order: number,
		public notes: string | null,
		public weight: number | null,
		public readonly createdAt: Date
	) {}

	/**
	 * Validates sets
	 */
	static validateSets(sets: number): void {
		if (sets < 1) {
			throw new Error('Exercise must have at least 1 set');
		}
	}

	/**
	 * Validates reps
	 */
	static validateReps(reps: string): void {
		if (!reps.trim()) {
			throw new Error('Exercise reps are required');
		}
	}

	/**
	 * Validates weight
	 */
	static validateWeight(weight: number | null): void {
		if (weight !== null && weight <= 0) {
			throw new Error('Weight must be positive');
		}
	}
}
