/**
 * SplitDay domain entity
 */
export class SplitDay {
	constructor(
		public readonly id: string,
		public readonly splitId: string,
		public dayNumber: number,
		public name: string,
		public isRestDay: boolean,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}
}
