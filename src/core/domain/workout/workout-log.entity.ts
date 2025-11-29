/**
 * WorkoutLog domain entity - tracks completed workouts
 */
export class WorkoutLog {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public readonly dayId: string,
		public duration: number | null,
		public notes: string | null,
		public readonly completedAt: Date,
		public readonly createdAt: Date
	) {}

	updateNotes(notes: string): void {
		this.notes = notes;
	}

	updateDuration(duration: number): void {
		if (duration < 0) {
			throw new Error('Duration must be positive');
		}
		this.duration = duration;
	}
}
