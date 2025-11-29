import { json } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { splitId, dayId } = params;

	const split = await container.splitRepository.findByIdWithDetails(splitId);

	if (!split) {
		return json({ error: 'Split not found' }, { status: 404 });
	}

	const day = split.days.find((d) => d.id === dayId);

	if (!day) {
		return json({ error: 'Day not found' }, { status: 404 });
	}

	return json(day);
};
