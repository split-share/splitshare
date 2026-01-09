import type { RequestEvent } from '@sveltejs/kit';
import type { LogContext } from '$core/ports/logger/logger.port';

/**
 * Action types for structured logging
 */
export type ActionType =
	// Split actions
	| 'split.create'
	| 'split.update'
	| 'split.delete'
	| 'split.like'
	| 'split.unlike'
	| 'split.view'
	// Exercise actions
	| 'exercise.create'
	| 'exercise.update'
	| 'exercise.delete'
	// Comment actions
	| 'comment.create'
	| 'comment.update'
	| 'comment.delete'
	// Review actions
	| 'review.create'
	| 'review.update'
	| 'review.delete'
	// Workout actions
	| 'workout.start'
	| 'workout.complete'
	| 'workout.abandon'
	| 'workout.set_complete'
	| 'workout.sync'
	| 'workout.log'
	// Weight tracking
	| 'weight.add'
	| 'weight.delete'
	// Forum actions
	| 'forum.topic_create'
	| 'forum.post_create'
	| 'forum.post_update'
	| 'forum.post_delete'
	| 'forum.topic_delete'
	// Auth actions
	| 'auth.login'
	| 'auth.logout'
	| 'auth.register'
	| 'auth.password_reset';

interface ActionContext extends LogContext {
	action: ActionType;
	success: boolean;
	resourceId?: string;
	resourceType?: string;
}

/**
 * Log a user action with full context
 * Enriches the request context and logs the action
 */
export function logAction(
	event: RequestEvent,
	action: ActionType,
	context: {
		success: boolean;
		resourceId?: string;
		resourceType?: string;
		error?: Error | string;
		metadata?: Record<string, unknown>;
	}
): void {
	const { success, resourceId, resourceType, error, metadata } = context;
	const userId = event.locals.user?.id;

	// Build action context
	const actionContext: ActionContext = {
		action,
		success,
		userId,
		userEmail: event.locals.user?.email,
		userName: event.locals.user?.name,
		resourceId,
		resourceType,
		...metadata
	};

	// Add business context to request context for wide event
	event.locals.requestContext.set('action', action);
	if (resourceId) {
		event.locals.requestContext.set('resourceId', resourceId);
		event.locals.requestContext.set('resourceType', resourceType);
	}

	// Add error context if present
	if (error) {
		if (error instanceof Error) {
			actionContext.errorType = error.name;
			actionContext.errorMessage = error.message;
			actionContext.errorStack = error.stack;
		} else {
			actionContext.errorMessage = error;
		}
	}

	// Log at appropriate level
	const message = `${action} ${success ? 'succeeded' : 'failed'}`;
	if (success) {
		event.locals.logger.info(message, actionContext);
	} else {
		event.locals.logger.warn(message, actionContext);
	}
}

/**
 * Helper to wrap an action handler with automatic logging
 */
export function withActionLogging<T>(
	event: RequestEvent,
	action: ActionType,
	resourceType: string,
	handler: () => Promise<{ resourceId?: string; result: T }>
): Promise<T> {
	return handler()
		.then(({ resourceId, result }) => {
			logAction(event, action, {
				success: true,
				resourceId,
				resourceType
			});
			return result;
		})
		.catch((error) => {
			logAction(event, action, {
				success: false,
				resourceType,
				error
			});
			throw error;
		});
}
