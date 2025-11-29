/**
 * ExerciseLog domain entity - tracks individual exercise performance
 */
export class ExerciseLog {
	constructor(
		public readonly id: string,
		public readonly workoutLogId: string,
		public readonly exerciseId: string,
		public sets: number,
		public reps: string,
		public weight: number | null,
		public notes: string | null,
		public readonly createdAt: Date
	) {}

	static validateSets(sets: number): void {
		if (sets < 1) {
			throw new Error('Sets must be at least 1');
		}
	}

	static validateWeight(weight: number): void {
		if (weight < 0) {
			throw new Error('Weight cannot be negative');
		}
	}
}
