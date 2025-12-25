/**
 * Port (interface) for Logger service
 * Any logger provider must implement this interface
 *
 * Follows the "Wide Events" pattern from loggingsucks.com:
 * - Emit one rich, structured event per request
 * - Include high cardinality fields (user IDs, request IDs)
 * - Include business context
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Contextual data that can be attached to log entries
 */
export interface LogContext {
	// Request context
	requestId?: string;
	traceId?: string;
	method?: string;
	path?: string;
	statusCode?: number;
	durationMs?: number;

	// User context
	userId?: string;
	userEmail?: string;
	userName?: string;

	// Business context
	splitId?: string;
	exerciseId?: string;
	workoutSessionId?: string;

	// Error context
	errorType?: string;
	errorCode?: string;
	errorMessage?: string;
	errorStack?: string;
	isRetriable?: boolean;

	// Custom fields
	[key: string]: unknown;
}

/**
 * Wide event data structure for canonical log lines
 * Built throughout request lifecycle, emitted once at completion
 */
export interface WideEvent extends LogContext {
	timestamp: string;
	level: LogLevel;
	message: string;
	serviceName: string;
	serviceVersion: string;
	environment: string;
}

/**
 * Logger port interface
 */
export interface ILoggerService {
	/**
	 * Log at trace level (most verbose)
	 */
	trace(message: string, context?: LogContext): void;

	/**
	 * Log at debug level
	 */
	debug(message: string, context?: LogContext): void;

	/**
	 * Log at info level
	 */
	info(message: string, context?: LogContext): void;

	/**
	 * Log at warn level
	 */
	warn(message: string, context?: LogContext): void;

	/**
	 * Log at error level
	 */
	error(message: string, context?: LogContext): void;

	/**
	 * Log at fatal level (most severe)
	 */
	fatal(message: string, context?: LogContext): void;

	/**
	 * Create a child logger with preset context
	 * Useful for request-scoped logging
	 */
	child(context: LogContext): ILoggerService;

	/**
	 * Emit a wide event (canonical log line)
	 * Should be called once per request at completion
	 */
	emitWideEvent(event: Partial<WideEvent>): void;
}
