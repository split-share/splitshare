import pino, { type Logger } from 'pino';
import type {
	ILoggerService,
	LogContext,
	WideEvent,
	LogLevel
} from '$core/ports/logger/logger.port';

const LOG_LEVEL_MAP: Record<LogLevel, pino.Level> = {
	trace: 'trace',
	debug: 'debug',
	info: 'info',
	warn: 'warn',
	error: 'error',
	fatal: 'fatal'
};

interface PinoLoggerConfig {
	serviceName: string;
	serviceVersion: string;
	environment: string;
	level?: LogLevel;
	prettyPrint?: boolean;
}

/**
 * Pino adapter for Logger service
 * Implements structured logging following the "Wide Events" pattern
 */
export class PinoLoggerAdapter implements ILoggerService {
	private readonly logger: Logger;
	private readonly serviceName: string;
	private readonly serviceVersion: string;
	private readonly environment: string;

	constructor(config: PinoLoggerConfig) {
		this.serviceName = config.serviceName;
		this.serviceVersion = config.serviceVersion;
		this.environment = config.environment;

		const isDev = config.environment === 'development' || config.prettyPrint;

		this.logger = pino({
			level: config.level || (isDev ? 'debug' : 'info'),
			base: {
				serviceName: this.serviceName,
				serviceVersion: this.serviceVersion,
				environment: this.environment
			},
			timestamp: pino.stdTimeFunctions.isoTime,
			...(isDev && {
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
						singleLine: false
					}
				}
			})
		});
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
		return new PinoChildLoggerAdapter(
			this.logger.child(this.sanitizeContext(context)),
			this.serviceName,
			this.serviceVersion,
			this.environment
		);
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

		const level = LOG_LEVEL_MAP[wideEvent.level];
		this.logger[level](this.sanitizeContext(wideEvent), wideEvent.message);
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		const pinoLevel = LOG_LEVEL_MAP[level];
		if (context) {
			this.logger[pinoLevel](this.sanitizeContext(context), message);
		} else {
			this.logger[pinoLevel](message);
		}
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
				sanitized[key] = JSON.parse(JSON.stringify(value));
			} else {
				sanitized[key] = value;
			}
		}

		return sanitized;
	}
}

/**
 * Child logger that maintains parent context
 */
class PinoChildLoggerAdapter implements ILoggerService {
	constructor(
		private readonly logger: Logger,
		private readonly serviceName: string,
		private readonly serviceVersion: string,
		private readonly environment: string
	) {}

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
		return new PinoChildLoggerAdapter(
			this.logger.child(this.sanitizeContext(context)),
			this.serviceName,
			this.serviceVersion,
			this.environment
		);
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

		const level = LOG_LEVEL_MAP[wideEvent.level];
		this.logger[level](this.sanitizeContext(wideEvent), wideEvent.message);
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		const pinoLevel = LOG_LEVEL_MAP[level];
		if (context) {
			this.logger[pinoLevel](this.sanitizeContext(context), message);
		} else {
			this.logger[pinoLevel](message);
		}
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
				sanitized[key] = JSON.parse(JSON.stringify(value));
			} else {
				sanitized[key] = value;
			}
		}

		return sanitized;
	}
}
