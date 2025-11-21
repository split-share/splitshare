import type { User, Follow } from '$lib/server/db/schema';

export type { User, Follow };

export interface UserProfile extends User {
	followersCount: number;
	followingCount: number;
	splitsCount: number;
	isFollowing: boolean;
}

export interface UserStats {
	followersCount: number;
	followingCount: number;
	splitsCount: number;
	workoutsCount: number;
}
