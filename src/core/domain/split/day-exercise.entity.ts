/**
 * DayExercise domain entity - junction between day and exercise
 */

export type ExerciseGroupType = 'superset' | 'triset';

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
		public groupId: string | null,
		public groupType: ExerciseGroupType | null,
		public readonly createdAt: Date
	) {}

	isGrouped(): boolean {
		return this.groupId !== null;
	}
}
