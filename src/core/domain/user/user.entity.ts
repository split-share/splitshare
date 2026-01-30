/**
 * User domain entity - represents a user account in the system
 * Contains user profile information, email verification status, and avatar
 * Provides methods for profile updates and email verification
 */
export class User {
	/**
	 * Creates a new User instance
	 * @param {string} id - Unique identifier for the user
	 * @param {string} name - Display name of the user
	 * @param {string} email - Email address (unique, used for login)
	 * @param {boolean} emailVerified - Whether the email has been verified
	 * @param {string | null} image - URL to user's profile image/avatar
	 * @param {Date} createdAt - Timestamp when the account was created
	 * @param {Date} updatedAt - Timestamp of last profile update
	 */
	constructor(
		public readonly id: string,
		public name: string,
		public readonly email: string,
		public emailVerified: boolean,
		public image: string | null,
		public readonly createdAt: Date,
		public updatedAt: Date
	) {}

	/**
	 * Updates user profile information
	 * Only updates fields that are explicitly provided (undefined fields are skipped)
	 * Automatically updates the updatedAt timestamp
	 * @param {Object} data - Partial update data
	 * @param {string} [data.name] - New display name
	 * @param {string | null} [data.image] - New profile image URL (null to remove)
	 */
	updateProfile(data: { name?: string; image?: string | null }): void {
		if (data.name !== undefined) this.name = data.name;
		if (data.image !== undefined) this.image = data.image;
		this.updatedAt = new Date();
	}

	/**
	 * Marks the user's email as verified
	 * Sets emailVerified to true and updates the updatedAt timestamp
	 */
	verifyEmail(): void {
		this.emailVerified = true;
		this.updatedAt = new Date();
	}
}
