import { container } from '$infrastructure/di/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return { splits: [] };
	}

	const splits = await container.splitRepository.findByUserId(event.locals.user.id);

	return {
		splits
	};
};
