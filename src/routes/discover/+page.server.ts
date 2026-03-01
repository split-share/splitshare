import { rateLimit, feedLimiter, rateLimitError } from '$lib/server/rate-limit';
import { container } from '$infrastructure/di/container';
import { ITEMS_PER_PAGE } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const rateLimitResult = await rateLimit(event, feedLimiter);
	if (!rateLimitResult.success) {
		throw rateLimitError(rateLimitResult.reset);
	}

	const url = new URL(event.request.url);
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
	const difficultyFilter = url.searchParams.get('difficulty');

	const filters = {
		isPublic: true,
		...(difficultyFilter && ['beginner', 'intermediate', 'advanced'].includes(difficultyFilter)
			? { difficulty: difficultyFilter as 'beginner' | 'intermediate' | 'advanced' }
			: {})
	};

	const offset = (page - 1) * ITEMS_PER_PAGE;

	const [popularSplits, totalCount] = await Promise.all([
		container.splitRepository.findWithFilters(
			filters,
			{ limit: ITEMS_PER_PAGE, offset },
			event.locals.user?.id
		),
		container.splitRepository.countWithFilters(filters)
	]);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	return {
		popularSplits,
		currentPage: page,
		totalPages,
		hasMore: page < totalPages,
		user: event.locals.user || null,
		appliedFilter: difficultyFilter
	};
};
