import { error } from '@sveltejs/kit';
import { splitService } from '$lib/services/splits';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const splitId = event.params.id;
	const currentUserId = event.locals.user?.id;

	const splitData = await splitService.getSplitById(splitId, currentUserId);

	if (!splitData) {
		error(404, 'Split not found');
	}

	return {
		split: splitData
	};
};
