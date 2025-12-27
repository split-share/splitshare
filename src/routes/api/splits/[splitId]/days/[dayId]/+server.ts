import { json } from '@sveltejs/kit';
import { container } from '$infrastructure/di/container';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { splitId, dayId } = params;
	const userId = locals.user?.id;

	const split = await container.splitRepository.findByIdWithDetails(splitId);

	if (!split) {
		return json({ error: 'Split not found' }, { status: 404 });
	}

	// Security: Only allow access if split is public OR user owns it
	const isOwner = userId && split.split.userId === userId;
	if (!split.split.isPublic && !isOwner) {
		return json({ error: 'Split not found' }, { status: 404 });
	}

	const day = split.days.find((d) => d.id === dayId);

	if (!day) {
		return json({ error: 'Day not found' }, { status: 404 });
	}

	return json(day);
};
