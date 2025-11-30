import { db } from '$lib/server/db';
import { ForumRepository } from '$lib/services/forum/forum.repository';
import { ForumService } from '$lib/services/forum/forum.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const repository = new ForumRepository(db);
	const service = new ForumService(repository);

	const categories = await service.getCategoriesWithStats();

	return {
		categories
	};
};
