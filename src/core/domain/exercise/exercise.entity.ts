/**
 * Exercise domain entity
 */
export class Exercise {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public name: string,
		public description: string | null,
		public difficulty: 'beginner' | 'intermediate' | 'advanced',
		public muscleGroup: string,
		public equipmentType: string,
		public imageUrl: string | null,
		public gifUrl: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	/**
	 * Updates exercise metadata
	 */
	update(data: {
		name?: string;
		description?: string | null;
		difficulty?: 'beginner' | 'intermediate' | 'advanced';
		muscleGroup?: string;
		equipmentType?: string;
		imageUrl?: string | null;
		gifUrl?: string | null;
	}): void {
		if (data.name !== undefined) this.name = data.name;
		if (data.description !== undefined) this.description = data.description;
		if (data.difficulty !== undefined) this.difficulty = data.difficulty;
		if (data.muscleGroup !== undefined) this.muscleGroup = data.muscleGroup;
		if (data.equipmentType !== undefined) this.equipmentType = data.equipmentType;
		if (data.imageUrl !== undefined) this.imageUrl = data.imageUrl;
		if (data.gifUrl !== undefined) this.gifUrl = data.gifUrl;
		this.updatedAt = new Date();
	}
}
