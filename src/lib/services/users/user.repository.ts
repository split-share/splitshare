import { eq, and, sql } from 'drizzle-orm';
import { user, follows, splits, workoutLogs } from '$lib/server/db/schema';
import { BaseRepository } from '../shared/utils';
import type { UserProfile, UserStats } from './types';

export class UserRepository extends BaseRepository {
	async findProfileById(id: string, currentUserId?: string): Promise<UserProfile | undefined> {
		const [result] = await this.db
			.select({
				user: user,
				followersCount: sql<number>`cast(
					(select count(*) from ${follows} where ${follows.followingId} = ${user.id})
					as integer
				)`,
				followingCount: sql<number>`cast(
					(select count(*) from ${follows} where ${follows.followerId} = ${user.id})
					as integer
				)`,
				splitsCount: sql<number>`cast(
					(select count(*) from ${splits} where ${splits.userId} = ${user.id})
					as integer
				)`,
				isFollowing: currentUserId
					? sql<boolean>`exists(
						select 1 from ${follows}
						where ${follows.followerId} = ${currentUserId}
						and ${follows.followingId} = ${user.id}
					)`
					: sql<boolean>`false`
			})
			.from(user)
			.where(eq(user.id, id));

		if (!result) return undefined;

		return {
			...result.user,
			followersCount: result.followersCount,
			followingCount: result.followingCount,
			splitsCount: result.splitsCount,
			isFollowing: result.isFollowing
		};
	}

	async getUserStats(userId: string): Promise<UserStats> {
		const [stats] = await this.db
			.select({
				followersCount: sql<number>`cast(
					(select count(*) from ${follows} where ${follows.followingId} = ${userId})
					as integer
				)`,
				followingCount: sql<number>`cast(
					(select count(*) from ${follows} where ${follows.followerId} = ${userId})
					as integer
				)`,
				splitsCount: sql<number>`cast(
					(select count(*) from ${splits} where ${splits.userId} = ${userId})
					as integer
				)`,
				workoutsCount: sql<number>`cast(
					(select count(*) from ${workoutLogs} where ${workoutLogs.userId} = ${userId})
					as integer
				)`
			})
			.from(user)
			.where(eq(user.id, userId));

		return stats;
	}

	async followUser(followerId: string, followingId: string): Promise<void> {
		await this.db.insert(follows).values({
			followerId,
			followingId
		});
	}

	async unfollowUser(followerId: string, followingId: string): Promise<void> {
		await this.db
			.delete(follows)
			.where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
	}

	async isFollowing(followerId: string, followingId: string): Promise<boolean> {
		const result = await this.db
			.select({ id: follows.id })
			.from(follows)
			.where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
			.limit(1);
		return result.length > 0;
	}
}
