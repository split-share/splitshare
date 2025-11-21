import { splitService } from '$lib/services/splits';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return { splits: [] };
	}

	const splits = await splitService.getUserSplits(event.locals.user.id);

	return {
		splits
	};
};
