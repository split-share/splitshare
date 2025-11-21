/**
 * Filters splits by difficulty level using URL params
 *
 * @param {string | null} difficulty - Difficulty level to filter by, or null for all
 */
export function filterByDifficulty(difficulty: string | null) {
	const url = new URL(window.location.href);

	if (difficulty) {
		url.searchParams.set('difficulty', difficulty);
	} else {
		url.searchParams.delete('difficulty');
	}

	window.location.href = url.toString();
}
