import { rateLimit, feedLimiter, rateLimitError } from '$lib/server/rate-limit';
import { splitRepository } from '$lib/services/splits';
import { ITEMS_PER_PAGE } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const rateLimitResult = await rateLimit(event, feedLimiter);
	if (!rateLimitResult.success) {
		throw rateLimitError(rateLimitResult.reset);
	}

	const url = new URL(event.request.url);
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const difficultyFilter = url.searchParams.get('difficulty');

	const filters = {
		isPublic: true,
		...(difficultyFilter && ['beginner', 'intermediate', 'advanced'].includes(difficultyFilter)
			? { difficulty: difficultyFilter as 'beginner' | 'intermediate' | 'advanced' }
			: {})
	};

	const offset = (page - 1) * ITEMS_PER_PAGE;

	const popularSplits = await splitRepository.findWithFilters(
		filters,
		{ limit: ITEMS_PER_PAGE, offset },
		event.locals.user?.id
	);

	const totalPages = Math.ceil(popularSplits.length / ITEMS_PER_PAGE);

	return {
		popularSplits,
		currentPage: page,
		totalPages,
		hasMore: page < totalPages,
		user: event.locals.user || null,
		appliedFilter: difficultyFilter
	};
};
