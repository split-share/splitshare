import { env } from '$env/dynamic/private';
import { PinoLoggerAdapter } from '$adapters/logger/pino/pino-logger.adapter';
import type { ILoggerService, LogLevel } from '$core/ports/logger/logger.port';

export { RequestContext, generateRequestId, createRequestLogger } from './request-context';
export { logAction, withActionLogging, type ActionType } from './action-logger';
export type {
	ILoggerService,
	LogContext,
	WideEvent,
	LogLevel
} from '$core/ports/logger/logger.port';

/**
 * Create the application logger instance
 */
function createLogger(): ILoggerService {
	const environment = env.NODE_ENV || 'development';
	const level = (env.LOG_LEVEL as LogLevel) || (environment === 'production' ? 'info' : 'debug');

	return new PinoLoggerAdapter({
		serviceName: 'splitshare',
		serviceVersion: env.npm_package_version || '1.0.0',
		environment,
		level,
		prettyPrint: environment === 'development'
	});
}

/**
 * Application logger singleton
 */
export const logger = createLogger();
