/**
 * WorkoutSession domain entity - tracks active workout sessions
 */
export type WorkoutPhase = 'exercise' | 'rest' | 'completed';

export interface CompletedSetData {
	exerciseIndex: number;
	setIndex: number;
	weight: number | null;
	reps: number;
	notes: string | null;
	completedAt: Date;
}

export class WorkoutSession {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly splitId: string,
		public readonly dayId: string,
		public currentExerciseIndex: number,
		public currentSetIndex: number,
		public phase: WorkoutPhase,
		public exerciseElapsedSeconds: number,
		public restRemainingSeconds: number | null,
		public readonly startedAt: Date,
		public pausedAt: Date | null,
		public lastUpdatedAt: Date,
		public completedSets: CompletedSetData[],
		public readonly createdAt: Date
	) {}

	isPaused(): boolean {
		return this.pausedAt !== null;
	}

	getTotalElapsedSeconds(): number {
		if (this.pausedAt) {
			return Math.floor((this.pausedAt.getTime() - this.startedAt.getTime()) / 1000);
		}
		return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
	}

	completeSet(weight: number | null, reps: number, notes: string | null): void {
		this.completedSets.push({
			exerciseIndex: this.currentExerciseIndex,
			setIndex: this.currentSetIndex,
			weight,
			reps,
			notes,
			completedAt: new Date()
		});
	}

	startRestPhase(restTimeSeconds: number): void {
		this.phase = 'rest';
		this.restRemainingSeconds = restTimeSeconds;
		this.exerciseElapsedSeconds = 0;
	}

	startNextSet(): void {
		this.currentSetIndex++;
		this.phase = 'exercise';
		this.exerciseElapsedSeconds = 0;
		this.restRemainingSeconds = null;
	}

	startNextExercise(): void {
		this.currentExerciseIndex++;
		this.currentSetIndex = 0;
		this.phase = 'exercise';
		this.exerciseElapsedSeconds = 0;
		this.restRemainingSeconds = null;
	}

	complete(): void {
		this.phase = 'completed';
	}

	pause(): void {
		this.pausedAt = new Date();
	}

	resume(): void {
		this.pausedAt = null;
		this.lastUpdatedAt = new Date();
	}
}
