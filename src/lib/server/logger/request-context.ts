import type {
	LogContext,
	WideEvent,
	LogLevel,
	ILoggerService
} from '$core/ports/logger/logger.port';

/**
 * Generates a unique request ID using crypto-secure randomization
 */
export function generateRequestId(): string {
	return `req_${crypto.randomUUID()}`;
}

/**
 * Request context builder for wide events
 * Accumulates data throughout request lifecycle
 */
export class RequestContext {
	private data: Partial<WideEvent> = {};
	private startTime: number;

	constructor(requestId?: string) {
		this.startTime = performance.now();
		this.data.requestId = requestId || generateRequestId();
		this.data.timestamp = new Date().toISOString();
	}

	get requestId(): string {
		return this.data.requestId as string;
	}

	/**
	 * Set HTTP request info
	 */
	setRequest(method: string, path: string, url?: string): this {
		this.data.method = method;
		this.data.path = path;
		if (url) {
			this.data.url = url;
		}
		return this;
	}

	/**
	 * Set response status
	 */
	setResponse(statusCode: number): this {
		this.data.statusCode = statusCode;
		return this;
	}

	/**
	 * Set user context
	 */
	setUser(userId?: string, email?: string, name?: string): this {
		if (userId) this.data.userId = userId;
		if (email) this.data.userEmail = email;
		if (name) this.data.userName = name;
		return this;
	}

	/**
	 * Set error context
	 */
	setError(error: Error | unknown): this {
		if (error instanceof Error) {
			this.data.errorType = error.name;
			this.data.errorMessage = error.message;
			this.data.errorStack = error.stack;
		} else if (typeof error === 'string') {
			this.data.errorMessage = error;
		} else {
			this.data.errorMessage = String(error);
		}
		return this;
	}

	/**
	 * Add business context (split, exercise, workout, etc.)
	 */
	addBusinessContext(context: Partial<LogContext>): this {
		Object.assign(this.data, context);
		return this;
	}

	/**
	 * Add custom field
	 */
	set(key: string, value: unknown): this {
		(this.data as Record<string, unknown>)[key] = value;
		return this;
	}

	/**
	 * Build the wide event
	 */
	build(level?: LogLevel, message?: string): Partial<WideEvent> {
		const durationMs = performance.now() - this.startTime;

		return {
			...this.data,
			level: level || this.determineLevel(),
			message: message || this.determineMessage(),
			durationMs: Math.round(durationMs * 100) / 100
		};
	}

	private determineLevel(): LogLevel {
		const statusCode = this.data.statusCode;
		if (!statusCode) return 'info';

		if (statusCode >= 500) return 'error';
		if (statusCode >= 400) return 'warn';
		return 'info';
	}

	private determineMessage(): string {
		const { method, path, statusCode } = this.data;
		if (method && path) {
			return `${method} ${path} ${statusCode || ''}`.trim();
		}
		return 'request completed';
	}
}

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(
	logger: ILoggerService,
	context: RequestContext
): ILoggerService {
	return logger.child({
		requestId: context.requestId
	});
}
