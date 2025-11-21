import { db } from '$lib/server/db';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

export const userRepository = new UserRepository(db);
export const userService = new UserService(userRepository);

export { UserRepository, UserService };
export type * from './types';
