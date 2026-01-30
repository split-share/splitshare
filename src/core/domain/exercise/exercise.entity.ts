/**
 * Exercise domain entity - represents an individual exercise
 * Contains exercise metadata including muscle groups, difficulty, equipment, and media
 * Used as a catalog of available exercises that can be assigned to splits
 */
export class Exercise {
	/**
	 * Creates a new Exercise instance
	 * @param {string} id - Unique identifier for the exercise
	 * @param {string} userId - ID of the user who created the exercise (or system ID for defaults)
	 * @param {string} name - Exercise name/title
	 * @param {string | null} description - Detailed description of how to perform the exercise
	 * @param {'beginner' | 'intermediate' | 'advanced'} difficulty - Difficulty level classification
	 * @param {string} muscleGroup - Primary muscle group targeted (e.g., "Chest", "Back", "Legs")
	 * @param {string} equipmentType - Required equipment (e.g., "Barbell", "Dumbbell", "Bodyweight")
	 * @param {string | null} imageUrl - URL to static exercise image
	 * @param {string | null} gifUrl - URL to animated GIF demonstrating the exercise
	 * @param {Date} createdAt - Timestamp when exercise was created
	 * @param {Date} updatedAt - Timestamp of last exercise update
	 */
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
	 * Updates exercise metadata with provided data
	 * Only updates fields that are explicitly provided (undefined fields are skipped)
	 * Automatically updates the updatedAt timestamp
	 * @param {Object} data - Partial update data
	 * @param {string} [data.name] - New exercise name
	 * @param {string | null} [data.description] - New description
	 * @param {'beginner' | 'intermediate' | 'advanced'} [data.difficulty] - New difficulty level
	 * @param {string} [data.muscleGroup] - New muscle group classification
	 * @param {string} [data.equipmentType] - New equipment type
	 * @param {string | null} [data.imageUrl] - New image URL
	 * @param {string | null} [data.gifUrl] - New GIF URL
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
