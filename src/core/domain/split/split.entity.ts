/**
 * Split domain entity - pure business object
 */
export class Split {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public title: string,
		public description: string | null,
		public isPublic: boolean,
		public isDefault: boolean,
		public difficulty: 'beginner' | 'intermediate' | 'advanced',
		public duration: number | null,
		public imageUrl: string | null,
		public videoUrl: string | null,
		public tags: string[] | null,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	/**
	 * Updates split metadata
	 */
	update(data: {
		title?: string;
		description?: string | null;
		isPublic?: boolean;
		difficulty?: 'beginner' | 'intermediate' | 'advanced';
		duration?: number | null;
		imageUrl?: string | null;
		videoUrl?: string | null;
		tags?: string[] | null;
	}): void {
		if (data.title !== undefined) this.title = data.title;
		if (data.description !== undefined) this.description = data.description;
		if (data.isPublic !== undefined) this.isPublic = data.isPublic;
		if (data.difficulty !== undefined) this.difficulty = data.difficulty;
		if (data.duration !== undefined) this.duration = data.duration;
		if (data.imageUrl !== undefined) this.imageUrl = data.imageUrl;
		if (data.videoUrl !== undefined) this.videoUrl = data.videoUrl;
		if (data.tags !== undefined) this.tags = data.tags;
		this.updatedAt = new Date();
	}
}
