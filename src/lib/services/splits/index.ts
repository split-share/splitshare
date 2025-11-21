import { db } from '$lib/server/db';
import { SplitRepository } from './split.repository';
import { SplitService } from './split.service';

export const splitRepository = new SplitRepository(db);
export const splitService = new SplitService(splitRepository);

export { SplitRepository, SplitService };
export type * from './types';
