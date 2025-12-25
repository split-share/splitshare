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
		if (data.weight !== undefined) {
			WeightEntry.validateWeight(data.weight);
			this.weight = data.weight;
		}
		if (data.recordedAt !== undefined) {
			WeightEntry.validateRecordedDate(data.recordedAt);
			this.recordedAt = data.recordedAt;
		}
		if (data.notes !== undefined) this.notes = data.notes;
		this.updatedAt = new Date();
	}

	static validateWeight(weight: number): void {
		if (weight <= 0) {
			throw new Error('Weight must be greater than 0');
		}
		if (weight > 999.99) {
			throw new Error('Weight must be less than 1000 kg');
		}
		const rounded = Math.round(weight * 100) / 100;
		if (rounded !== weight) {
			throw new Error('Weight must have at most 2 decimal places');
		}
	}

	static validateRecordedDate(date: Date): void {
		const now = new Date();
		if (date > now) {
			throw new Error('Recorded date cannot be in the future');
		}
	}
}
