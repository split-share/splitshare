import { goto } from '$app/navigation';

/**
 * Updates URL with filter parameter and navigates to new URL
 * @param {string} param - URL parameter name
 * @param {string | null} value - Parameter value or null to remove
 * @param {boolean} keepFocus - Whether to keep focus on current element
 * @param {boolean} noScroll - Whether to prevent scrolling
 */
export function updateUrlParam(
	param: string,
	value: string | null,
	options: { keepFocus?: boolean; noScroll?: boolean } = {}
) {
	const url = new URL(window.location.href);
	if (value) {
		url.searchParams.set(param, value);
	} else {
		url.searchParams.delete(param);
	}
	goto(url.toString(), { keepFocus: options.keepFocus ?? true, noScroll: options.noScroll ?? true });
}

/**
 * Filters splits by difficulty level
 * @param {string | null} difficulty - Difficulty level to filter by, or null for all
 */
export function filterByDifficulty(difficulty: string | null) {
	updateUrlParam('difficulty', difficulty);
}
