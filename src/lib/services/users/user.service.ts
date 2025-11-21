import type { UserRepository } from './user.repository';
import type { UserProfile, UserStats } from './types';

export class UserService {
	constructor(private repository: UserRepository) {}

	async getUserProfile(id: string, currentUserId?: string): Promise<UserProfile | undefined> {
		return this.repository.findProfileById(id, currentUserId);
	}

	async getUserStats(userId: string): Promise<UserStats> {
		return this.repository.getUserStats(userId);
	}

	async followUser(followerId: string, followingId: string): Promise<void> {
		if (followerId === followingId) {
			throw new Error('Cannot follow yourself');
		}

		const isAlreadyFollowing = await this.repository.isFollowing(followerId, followingId);
		if (isAlreadyFollowing) {
			throw new Error('Already following this user');
		}

		await this.repository.followUser(followerId, followingId);
	}

	async unfollowUser(followerId: string, followingId: string): Promise<void> {
		if (followerId === followingId) {
			throw new Error('Cannot unfollow yourself');
		}

		const isFollowing = await this.repository.isFollowing(followerId, followingId);
		if (!isFollowing) {
			throw new Error('Not following this user');
		}

		await this.repository.unfollowUser(followerId, followingId);
	}

	async isFollowing(followerId: string, followingId: string): Promise<boolean> {
		return this.repository.isFollowing(followerId, followingId);
	}
}
