import { rateLimit, feedLimiter, rateLimitError } from '$lib/server/rate-limit';
import { splitRepository } from '$lib/services/splits';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const rateLimitResult = await rateLimit(event, feedLimiter);
	if (!rateLimitResult.success) {
		throw rateLimitError(rateLimitResult.reset);
	}

	const url = new URL(event.request.url);
	const difficultyFilter = url.searchParams.get('difficulty');

	const filters = {
		isDefault: true,
		isPublic: true,
		...(difficultyFilter && ['beginner', 'intermediate', 'advanced'].includes(difficultyFilter)
			? { difficulty: difficultyFilter as 'beginner' | 'intermediate' | 'advanced' }
			: {})
	};

	const defaultSplits = await splitRepository.findWithFilters(
		filters,
		{ limit: 100, offset: 0 },
		event.locals.user?.id
	);

	return {
		defaultSplits,
		user: event.locals.user || null,
		appliedFilter: difficultyFilter
	};
};
