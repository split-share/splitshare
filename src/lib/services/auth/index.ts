import { db } from '$lib/server/db';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

export const authRepository = new AuthRepository(db);
export const authService = new AuthService(authRepository);

export { AuthRepository, AuthService };
export type * from './types';
