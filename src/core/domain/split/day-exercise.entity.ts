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
}
