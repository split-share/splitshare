export class WeightEntry {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public weight: number,
		public recordedAt: Date,
		public notes: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	update(data: { weight?: number; recordedAt?: Date; notes?: string | null }): void {
		if (data.weight !== undefined) this.weight = data.weight;
		if (data.recordedAt !== undefined) this.recordedAt = data.recordedAt;
		if (data.notes !== undefined) this.notes = data.notes;
		this.updatedAt = new Date();
	}
}
