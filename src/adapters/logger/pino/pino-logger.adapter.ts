import type {
	ILoggerService,
	LogContext,
	WideEvent,
	LogLevel
} from '$core/ports/logger/logger.port';

const LOG_LEVELS: Record<LogLevel, number> = {
	trace: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60
};

interface LoggerConfig {
	serviceName: string;
	serviceVersion: string;
	environment: string;
	level?: LogLevel;
	prettyPrint?: boolean;
}

/**
 * Simple console-based logger adapter
 * Compatible with Cloudflare Workers (no Node.js dependencies)
 */
export class PinoLoggerAdapter implements ILoggerService {
	private readonly serviceName: string;
	private readonly serviceVersion: string;
	private readonly environment: string;
	private readonly minLevel: number;
	private readonly baseContext: Record<string, unknown>;

	constructor(config: LoggerConfig) {
		this.serviceName = config.serviceName;
		this.serviceVersion = config.serviceVersion;
		this.environment = config.environment;
		this.minLevel = LOG_LEVELS[config.level || 'info'];
		this.baseContext = {
			serviceName: this.serviceName,
			serviceVersion: this.serviceVersion,
			environment: this.environment
		};
	}

	trace(message: string, context?: LogContext): void {
		this.log('trace', message, context);
	}

	debug(message: string, context?: LogContext): void {
		this.log('debug', message, context);
	}

	info(message: string, context?: LogContext): void {
		this.log('info', message, context);
	}

	warn(message: string, context?: LogContext): void {
		this.log('warn', message, context);
	}

	error(message: string, context?: LogContext): void {
		this.log('error', message, context);
	}

	fatal(message: string, context?: LogContext): void {
		this.log('fatal', message, context);
	}

	child(context: LogContext): ILoggerService {
		const childLogger = new PinoLoggerAdapter({
			serviceName: this.serviceName,
			serviceVersion: this.serviceVersion,
			environment: this.environment,
			level: this.getLevelName(this.minLevel)
		});
		// Merge parent context
		Object.assign(childLogger.baseContext, this.sanitizeContext(context));
		return childLogger;
	}

	emitWideEvent(event: Partial<WideEvent>): void {
		const wideEvent: WideEvent = {
			timestamp: new Date().toISOString(),
			level: event.level || 'info',
			message: event.message || 'request completed',
			serviceName: this.serviceName,
			serviceVersion: this.serviceVersion,
			environment: this.environment,
			...event
		};

		this.log(wideEvent.level, wideEvent.message, wideEvent);
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		if (LOG_LEVELS[level] < this.minLevel) return;

		const logEntry = {
			level,
			time: new Date().toISOString(),
			msg: message,
			...this.baseContext,
			...(context ? this.sanitizeContext(context) : {})
		};

		const output = JSON.stringify(logEntry);

		switch (level) {
			case 'error':
			case 'fatal':
				console.error(output);
				break;
			case 'warn':
				console.warn(output);
				break;
			case 'debug':
			case 'trace':
				console.debug(output);
				break;
			default:
				console.log(output);
		}
	}

	private getLevelName(levelNum: number): LogLevel {
		for (const [name, num] of Object.entries(LOG_LEVELS)) {
			if (num === levelNum) return name as LogLevel;
		}
		return 'info';
	}

	private sanitizeContext(context: LogContext): Record<string, unknown> {
		const sanitized: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(context)) {
			if (value === undefined) continue;

			if (value instanceof Error) {
				sanitized[key] = {
					name: value.name,
					message: value.message,
					stack: value.stack
				};
			} else if (typeof value === 'object' && value !== null) {
				try {
					sanitized[key] = JSON.parse(JSON.stringify(value));
				} catch {
					sanitized[key] = String(value);
				}
			} else {
				sanitized[key] = value;
			}
		}

		return sanitized;
	}
}
